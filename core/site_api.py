"""JSON API used by the React frontend (/api/site/...).

It reuses the existing models and Django forms, so validation rules and field
definitions stay in ONE place (forms.py). The old DRF mobile API in api.py is untouched.
"""
from django import forms
from django.conf import settings
from django.contrib.staticfiles.storage import staticfiles_storage
from django.core.cache import cache
from django.core.paginator import Paginator
from django.db.models import Avg, Count, F, Q
from django.http import Http404, JsonResponse
from django.template.defaultfilters import date as fmt_date
from django.urls import path
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.http import require_GET, require_POST

from .forms import SERVICES, ContactForm, InquiryForm, ListingForm, ProviderForm
from .models import (AMENITIES, HOUSE_TYPES, SERVICE_CHOICES, Announcement, Area, Institution, Lead, Post, Property,
                     PropertyMedia, Review, SearchLog, ServiceProvider)
from .utils import notify, wa_link

# ---------------------------------------------------------------- helpers

def live():
    return Property.objects.filter(status="approved", is_available=True).prefetch_related("media")

def _int(v):
    try: return int(v)
    except (TypeError, ValueError): return None

def _static(p):
    try: return staticfiles_storage.url(p)
    except ValueError: return f"{settings.STATIC_URL}{p}"      # manifest missing (before collectstatic)

def _guard(request):
    """Honeypot + simple per-IP limit for public forms. Returns None when fine, else a JsonResponse."""
    if request.POST.get("website"): return JsonResponse({"ok": True, "redirect": "/"})
    ip = request.META.get("HTTP_X_FORWARDED_FOR", request.META.get("REMOTE_ADDR", "")).split(",")[0].strip()
    key = f"posts:{ip}"; cache.add(key, 0, 3600)
    try: n = cache.incr(key)
    except ValueError: n = 1
    if n > 12: return JsonResponse({"ok": False, "message": "Too many requests. Please try again later."}, status=429)

HOME_SERVICES = [
    ("house", "core/menu-house.webp", "Looking for a house?", "Let us help you find a home that fits your needs, budget and lifestyle."),
    ("internet", "core/services/internet.webp", "Need internet/Wi-Fi?", "Let us connect you to reliable internet for your new home."),
    ("gas", "core/services/gas.webp", "Need a gas cylinder or cooker?", "We\u2019ve got your kitchen covered; from buying or hiring to delivery."),
    ("items", "core/services/items.webp", "Need a mattress or furniture?", "Set up your home with ease; buy or hire mattresses and furniture, with convenient delivery."),
    ("moving", "core/services/moving.webp", "Moving out or into a new home?", "Let us make your move easier; from packing to transportation and settling in."),
    ("other", "core/services/other.webp", "More services", "Water refills, cleaning, repairs, security and more."),
]
AMENITY_GROUPS = [("Utilities", ["wifi", "water", "electricity"]),
                  ("Security and compound", ["security", "cctv", "own_compound", "shared_compound", "parking"]),
                  ("Inside the house", ["furnished", "tiles", "fans", "ceiling", "wardrobe", "ac", "kitchen", "balcony", "laundry"]),
                  ("Lifestyle and trust", ["pet_friendly"])]

# ---------------------------------------------------------------- serializers

def card(p, km=None):
    cover = p.cover
    return {"slug": p.slug, "title": p.title, "area": p.area, "house_type": p.house_type, "rent": int(p.rent),
            "thumb": cover.thumb.url if cover else None, "verified": p.is_verified,
            "verification_label": p.get_verification_display(), "units_vacant": p.units_vacant,
            "amenities": p.amenity_list[:3], "km": (str(getattr(p, "km", None)) if getattr(p, "km", None) is not None else None)}

def post_card(p):
    return {"slug": p.slug, "title": p.title, "category": p.get_category_display(), "summary": p.summary,
            "cover": p.cover.url if p.cover else None, "published": fmt_date(p.published_at, "j M Y") if p.published_at else "",
            "read_minutes": p.read_minutes}

def review_row(r):
    return {"name": r.name, "role": r.role, "rating": r.rating, "text": r.text,
            "service": r.get_service_display(), "date": fmt_date(r.created_at, "M Y")}

# ---------------------------------------------------------------- form schema (built from forms.py)

_ATTR_KEYS = ("maxlength", "minlength", "min", "max", "step", "accept", "rows")

def _value(v): return str(getattr(v, "value", v))

def form_schema(form):
    more = set(getattr(form, "more", ()))
    out = []
    for name, f in form.fields.items():
        w = f.widget; itype = getattr(w, "input_type", "")
        if isinstance(w, forms.Textarea): kind = "textarea"
        elif itype == "radio": kind = "radio"
        elif itype == "select": kind = "select"
        elif itype == "checkbox": kind = "checkbox"
        elif itype == "file": kind = "file"
        elif itype in ("date", "tel", "email", "number"): kind = itype
        elif isinstance(f, forms.DateField): kind = "date"
        else: kind = "text"
        attrs = {**f.widget_attrs(w), **w.attrs}
        item = {"name": name, "label": f.label or name.replace("_", " ").capitalize(), "kind": kind, "required": f.required,
                "help": str(f.help_text or ""), "more": name in more and not f.required,
                "attrs": {k: str(v) for k, v in attrs.items() if k in _ATTR_KEYS}}
        init = form.get_initial_for_field(f, name)
        if kind in ("select", "radio"):
            item["choices"] = [[_value(v), str(l)] for v, l in f.choices]
            if init in (None, ""): init = item["choices"][0][0] if item["choices"] else ""
            item["initial"] = _value(init)
        elif kind == "checkbox": item["initial"] = bool(init)
        elif kind != "file" and init not in (None, ""): item["initial"] = str(init)
        if w.attrs.get("data-pf"): item["pf"] = w.attrs["data-pf"]
        if w.attrs.get("autocomplete"): item["autocomplete"] = w.attrs["autocomplete"]
        if w.attrs.get("data-showif"): item["showif"] = w.attrs["data-showif"].split(":")
        if w.attrs.get("list"): item["list"] = w.attrs["list"]
        if kind == "tel": item["autocomplete"] = "tel"
        out.append(item)
    return out

def _errors(form):
    return JsonResponse({"ok": False, "errors": {k: [str(e) for e in v] for k, v in form.errors.items()}}, status=400)

# ---------------------------------------------------------------- data (also used to pre-load pages from spa.py)

def boot_data(request=None):
    labels = dict(AMENITIES); used = {k for _, ks in AMENITY_GROUPS for k in ks}
    groups = [[t, [[k, labels[k]] for k in ks if k in labels]] for t, ks in AMENITY_GROUPS]
    extra = [[k, l] for k, l in AMENITIES if k not in used]
    if extra: groups.append(["Other", extra])
    A = lambda p: _static(p)
    return {
        "phone": settings.PHONE, "email": settings.EMAIL,
        "wa": wa_link("Hello AMOXHomes, I would like to find a home and learn about your settling-in services. Could you assist me, please?"),
        "wa_package": wa_link("Hello AMOXHomes, I want the Move-In Package (house search, moving, mattress, gas, internet)."),
        "wa_landlord": wa_link("Hello AMOXHomes, I am a landlord and want to ask about Pro listing / verification."),
        "assets": {"hero_desktop": A("core/hero-desktop.webp"), "hero_mobile": A("core/hero-mobile.webp"), "logo": A("core/logo-sm.png"),
                   "menu_house": A("core/menu-house.webp"),
                   **{k: A(f"core/services/{k}.webp") for k in ("internet", "gas", "items", "moving", "other")}},
        "institutions": [{"name": i.name, "slug": i.slug} for i in Institution.objects.all()],
        "areas": list(Area.objects.filter(is_active=True).values_list("name", flat=True)),
        "house_types": [t for t, _ in HOUSE_TYPES],
        "amenity_groups": groups,
        "services": [{"key": k, "title": s[0], "intro": s[1], "icon": s[2]} for k, s in SERVICES.items()],
        "service_choices": [list(c) for c in SERVICE_CHOICES],
        "blog_categories": [list(c) for c in Post.CATEGORIES],
    }

def home_data(request):
    items = list(Announcement.live())
    ticker = items * (-(-8 // len(items))) if items else []
    return {"featured": [card(p) for p in live().order_by("-featured", "-verification", "-created_at")[:6]],
            "reviews": [review_row(r) for r in Review.objects.filter(status="approved")[:6]],
            "posts": [post_card(p) for p in Post.live()[:3]],
            "ticker": [{"text": a.text, "link": a.safe_link} for a in ticker], "ticker_secs": max(20, 6 * len(ticker)),
            "services": [{"key": k, "img": _static(img), "title": t, "text": x} for k, img, t, x in HOME_SERVICES]}

def houses_data(request, institution=None):
    g, qs = request.GET, live()
    inst = None
    if institution:
        inst = Institution.objects.filter(slug=institution).first()
        if not inst: raise Http404
    term = (g.get("q") or g.get("area") or (inst.name if inst else "")).strip().lower()[:80]
    if term and not g.get("page"): SearchLog.objects.create(term=term)
    if g.get("q"): qs = qs.filter(Q(title__icontains=g["q"]) | Q(area__icontains=g["q"]) | Q(estate__icontains=g["q"]))
    if g.get("area"): qs = qs.filter(Q(area__icontains=g["area"]) | Q(estate__icontains=g["area"]))
    if g.get("type"): qs = qs.filter(house_type=g["type"])
    if _int(g.get("min")) is not None: qs = qs.filter(rent__gte=_int(g["min"]))
    if _int(g.get("max")) is not None: qs = qs.filter(rent__lte=_int(g["max"]))
    for a, _ in AMENITIES:
        if g.get(a): qs = qs.filter(**{a: True})
    if g.get("verified"): qs = qs.filter(verification="verified")
    sort = {"price_asc": "rent", "price_desc": "-rent", "new": "-created_at"}.get(g.get("sort"))
    if sort: qs = qs.order_by(sort)
    if inst: qs = qs.filter(distances__institution=inst).annotate(km=F("distances__km")).order_by("km")
    page = Paginator(qs, 12).get_page(g.get("page"))
    return {"results": [card(p) for p in page], "total": page.paginator.count, "page": page.number,
            "num_pages": page.paginator.num_pages, "inst": {"name": inst.name, "slug": inst.slug} if inst else None}

def house_data(request, slug):
    p = Property.objects.filter(slug=slug, status="approved").first()
    if not p: raise Http404
    Property.objects.filter(pk=p.pk).update(views=F("views") + 1)
    media = list(p.media.all()); abs_url = request.build_absolute_uri(f"/houses/{p.slug}/")
    return {"slug": p.slug, "title": p.title, "area": p.area, "estate": p.estate, "house_type": p.house_type,
            "rent": int(p.rent), "deposit": int(p.deposit), "units_vacant": p.units_vacant, "is_available": p.is_available,
            "verified": p.is_verified, "verification_label": p.get_verification_display(),
            "verified_on": fmt_date(p.verified_on, "j M Y") if p.verified_on else "",
            "description": p.description, "environment": p.environment, "nearby": [list(x) for x in p.nearby],
            "amenities": p.amenity_list,
            "inside": [m.file.url for m in media if m.section == "inside" and m.kind == "photo"],
            "around": [m.file.url for m in media if m.section == "around" and m.kind == "photo"],
            "videos": [m.file.url for m in media if m.kind == "video"],
            "distances": [{"name": d.institution.name, "slug": d.institution.slug, "km": str(d.km)} for d in p.distances.select_related("institution")],
            "wa": wa_link(f"Hi AMOXHomes, I'm interested in {p.title} in {p.area}: {abs_url}"),
            "share": f"{p.title} in {p.area}, KSh {int(p.rent):,}/month: {abs_url}",
            "report_wa": wa_link(f"Hi AMOXHomes, I want to report this listing: {abs_url}"),
            "form": form_schema(InquiryForm())}

def service_data(request, kind):
    if kind not in SERVICES: raise Http404
    title, intro, icon, Form = SERVICES[kind]
    partners = ServiceProvider.objects.filter(category=kind, status="approved")
    return {"title": title, "intro": intro, "btn": "Send request", "form": form_schema(Form()),
            "partners": [{"business": pv.business, "package": pv.package, "speed": pv.speed, "price": pv.price,
                          "install_fee": pv.install_fee, "coverage": pv.coverage, "details": pv.details} for pv in partners]}

def contact_data(request):
    return {"title": "Contact us", "intro": "We reply fastest on WhatsApp. You can also use this form to report a listing.",
            "btn": "Send enquiry", "form": form_schema(ContactForm()), "contact": True}

def listing_data(request):
    return {"title": "List your property", "btn": "Submit listing", "form": form_schema(ListingForm()),
            "intro": "Basic listings are free and include 2 photos. We review every listing before it goes live. Ask us about Pro listing and verification.",
            "area_options": list(Area.objects.filter(is_active=True).values_list("name", flat=True))}

def provider_data(request):
    return {"title": "Register as a service provider", "btn": "Register my business", "form": form_schema(ProviderForm()),
            "intro": "Tenants request a connection through AMOXHomes and we refer them to approved partners."}

def reviews_data(request):
    qs = Review.objects.filter(status="approved"); agg = qs.aggregate(avg=Avg("rating"), n=Count("id"))
    return {"rows": [review_row(r) for r in qs[:60]], "avg": round(agg["avg"], 1) if agg["avg"] else None, "n": agg["n"]}

def blog_data(request):
    cat = request.GET.get("c", ""); qs = Post.live()
    if cat in dict(Post.CATEGORIES): qs = qs.filter(category=cat)
    else: cat = ""
    return {"posts": [post_card(p) for p in qs[:60]], "cat": cat}

def post_data(request, slug):
    p = Post.objects.filter(slug=slug, is_published=True).first()
    if not p: raise Http404
    url = request.build_absolute_uri(f"/blog/{p.slug}/")
    return {**post_card(p), "body": p.body, "share": f"{p.title}: {url}",
            "related": [post_card(r) for r in Post.live().exclude(pk=p.pk)[:3]]}

def thanks_data(request):
    kind, pk = request.session.get("last", [None, None])
    if kind == "lead":
        lead = Lead.objects.filter(pk=pk).first()
        if lead: return {"kind": "lead", "ref": lead.pk}
    elif kind == "listed":
        pr = Property.objects.filter(pk=pk).first()
        if pr: return {"kind": "listed", "title": pr.title}
    elif kind == "provider": return {"kind": "provider"}
    raise Http404

# ---------------------------------------------------------------- GET endpoints

def _json(fn):
    @require_GET
    def view(request, *a, **k):
        try: return JsonResponse(fn(request, *a, **k))
        except Http404: return JsonResponse({"detail": "Not found."}, status=404)
    return view

# ---------------------------------------------------------------- POST endpoints

def _save_lead(request, kind, form, prop=None):
    cd = form.cleaned_data
    details = {k.replace("_", " ").capitalize(): str(v) for k, v in cd.items() if k not in ("name", "phone") and v}
    lead = Lead.objects.create(kind=kind, name=cd["name"], phone=cd["phone"], details=details, property=prop)
    notify(f"New {lead.get_kind_display()} #{lead.pk}", lead.wa_text())
    request.session["last"] = ["lead", lead.pk]
    return JsonResponse({"ok": True, "redirect": "/thanks/"})

@require_POST
def post_request(request, kind):
    if kind not in SERVICES: return JsonResponse({"detail": "Not found."}, status=404)
    form = SERVICES[kind][3](request.POST)
    if not form.is_valid(): return _errors(form)
    return _guard(request) or _save_lead(request, kind, form)

@require_POST
def post_contact(request):
    form = ContactForm(request.POST)
    if not form.is_valid(): return _errors(form)
    return _guard(request) or _save_lead(request, "general", form)

@require_POST
def post_inquiry(request, slug):
    p = Property.objects.filter(slug=slug, status="approved").first()
    if not p: return JsonResponse({"detail": "Not found."}, status=404)
    form = InquiryForm(request.POST)
    if not form.is_valid(): return _errors(form)
    return _guard(request) or _save_lead(request, "inquiry", form, p)

@require_POST
def post_listing(request):
    form = ListingForm(request.POST, request.FILES)
    if not form.is_valid(): return _errors(form)
    if (blocked := _guard(request)): return blocked
    p = form.save(commit=False); p.status = "pending"; p.verification = "landlord"; p.save()
    for key, sec in (("photo1", "inside"), ("photo2", "inside"), ("around1", "around")):
        if form.cleaned_data.get(key): PropertyMedia.objects.create(property=p, file=form.cleaned_data[key], section=sec)
    if form.cleaned_data.get("video1"):
        PropertyMedia.objects.create(property=p, kind="video", section="around", file=form.cleaned_data["video1"])
    notify(f"New listing: {p.title}", f"{p.area}, KSh {p.rent}\n{p.owner_name} {p.owner_phone}\nReview it in the admin.")
    request.session["last"] = ["listed", p.pk]
    return JsonResponse({"ok": True, "redirect": "/thanks/"})

@require_POST
def post_provider(request):
    form = ProviderForm(request.POST)
    if not form.is_valid(): return _errors(form)
    if (blocked := _guard(request)): return blocked
    pv = form.save(); notify(f"New provider: {pv.business}", f"{pv.get_category_display()}, {pv.phone}\nApprove it in the admin.")
    request.session["last"] = ["provider", pv.pk]
    return JsonResponse({"ok": True, "redirect": "/thanks/"})

@require_POST
def post_review(request):
    if (blocked := _guard(request)): return blocked
    p = request.POST; name, text = p.get("name", "").strip(), p.get("text", "").strip()
    try: rating = int(p.get("rating", 0))
    except ValueError: rating = 0
    service = p.get("service", "")
    if 1 <= len(name) <= 60 and 10 <= len(text) <= 500 and 1 <= rating <= 5 and service in dict(SERVICE_CHOICES):
        r = Review.objects.create(name=name, role=p.get("role", "").strip()[:80], service=service, rating=rating, text=text)
        notify(f"New review ({rating}/5) from {name}", f"{text}\n\nApprove or reject it in the console.")
        return JsonResponse({"ok": True})
    return JsonResponse({"ok": False, "error": True}, status=400)

urlpatterns = [
    path("boot/", ensure_csrf_cookie(_json(boot_data))),   # sets the CSRF cookie when the page is not served by Django (e.g. Netlify)
    path("home/", _json(home_data)),
    path("houses/", _json(houses_data)),
    path("houses/near/<slug:institution>/", _json(houses_data)),
    path("houses/<slug:slug>/", _json(house_data)),
    path("houses/<slug:slug>/inquiry/", post_inquiry),
    path("services/<slug:kind>/", _json(service_data)),
    path("request/<slug:kind>/", post_request),
    path("contact/", _json(contact_data)),
    path("contact/send/", post_contact),
    path("landlords/list/", _json(listing_data)),
    path("landlords/list/send/", post_listing),
    path("providers/", _json(provider_data)),
    path("providers/send/", post_provider),
    path("reviews/", _json(reviews_data)),
    path("reviews/send/", post_review),
    path("blog/", _json(blog_data)),
    path("blog/<slug:slug>/", _json(post_data)),
    path("thanks/", _json(thanks_data)),
]