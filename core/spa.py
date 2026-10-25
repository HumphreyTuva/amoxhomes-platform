"""Serves the built React app (core/static/app/index.html) for every public page.

For each request it injects, into the HTML head:
  * a page-specific <title>, description and Open Graph tags (WhatsApp / Google previews),
  * site settings ("boot" data), and
  * the page's own data ("preload"), so React can paint immediately without a second request.
"""
from html import escape
from urllib.parse import urlencode

from django.conf import settings
from django.http import Http404, HttpResponse
from django.shortcuts import redirect
from django.urls import resolve
from django.utils.html import json_script
from django.views.decorators.csrf import ensure_csrf_cookie

from . import site_api as api
from .forms import SERVICES
from .models import Institution, Post, Property

INDEX = settings.BASE_DIR / "core" / "static" / "app" / "index.html"
DEFAULT_TITLE = "AMOXHomes | Houses & Settlement Support in Malindi"
DEFAULT_DESC = "Houses, bedsitters and student accommodation in Malindi and Kilifi, plus internet, gas, mattress hire and moving support."
DEFAULT_OGTITLE = "AMOXHomes | Connecting Students & Professionals to a Better Lifestyle"

STATIC_PAGES = {
    "home": {}, "services": {"title": "Internet, Gas, Mattress Hire & Moving Help in Malindi | AMOXHomes"},
    "landlords": {"title": "List Your Property in Malindi | AMOXHomes"}, "about": {"title": "About Us | AMOXHomes"},
    "thanks": {"title": "Thank you | AMOXHomes"},
    "reviews": {"title": "Reviews | AMOXHomes", "desc": "What students, professionals and landlords say about AMOXHomes."},
    "blog": {"title": "Blog | AMOXHomes", "desc": "Tips, guides and news about finding a home and settling into Malindi and Kilifi."},
    "privacy": {"title": "Privacy Policy | AMOXHomes"}, "terms": {"title": "Terms of Use | AMOXHomes"},
    "contact": {"title": "Contact us | AMOXHomes"}, "list_property": {"title": "List your property | AMOXHomes"},
    "providers": {"title": "Register as a service provider | AMOXHomes"},
}

def _key(path, params):
    """Same string the React app requests, so the preload is found (keys sorted for a stable match)."""
    items = sorted((k, v) for k, v in params.items() if v != "")
    return f"/api/site{path}" + (f"?{urlencode(items)}" if items else "")

def _page(request):
    """-> (status, meta dict, {api_key: data})"""
    m = resolve(request.path_info); name, kw = m.url_name, m.kwargs
    meta = {"title": DEFAULT_TITLE, "desc": DEFAULT_DESC, "ogtitle": DEFAULT_OGTITLE, "image": None, "preload_hero": False}
    pre, status = {}, 200
    host = f"{request.scheme}://{request.get_host()}"
    try:
        if name == "home":
            meta["preload_hero"] = True
            pre[_key("/home/", {})] = api.home_data(request)
        elif name in ("houses", "houses_near"):
            inst = kw.get("institution")
            data = api.houses_data(request, inst)
            if inst:
                meta.update(title=f"Houses near {data['inst']['name']} | AMOXHomes",
                            desc=f"Rental houses and student accommodation near {data['inst']['name']}, closest first.")
                path = f"/houses/near/{inst}/"
            else:
                meta.update(title="Houses & Bedsitters in Malindi | AMOXHomes", desc="Browse bedsitters, single rooms and apartments in Malindi and Kilifi.")
                path = "/houses/"
            pre[_key(path, request.GET.dict())] = data
        elif name == "property_detail":
            p = Property.objects.filter(slug=kw["slug"], status="approved").first()
            if not p: raise Http404
            data = api.house_data(request, kw["slug"])
            meta.update(title=f"{p.title}, {p.area} | AMOXHomes", desc=f"{p.title} in {p.area}, KSh {p.rent} per month.")
            if p.cover: meta["image"] = host + p.cover.thumb.url
            pre[_key(f"/houses/{kw['slug']}/", {})] = data
        elif name == "request":
            if kw["kind"] not in SERVICES: raise Http404
            meta["title"] = f"{SERVICES[kw['kind']][0]} | AMOXHomes"
            pre[_key(f"/services/{kw['kind']}/", {})] = api.service_data(request, kw["kind"])
        elif name == "blog":
            meta.update(STATIC_PAGES["blog"]); pre[_key("/blog/", request.GET.dict())] = api.blog_data(request)
        elif name == "blog_detail":
            p = Post.objects.filter(slug=kw["slug"], is_published=True).first()
            if not p: raise Http404
            meta.update(title=f"{p.title} | AMOXHomes", desc=p.summary, ogtitle=p.title)
            if p.cover: meta["image"] = host + p.cover.url
            pre[_key(f"/blog/{kw['slug']}/", {})] = api.post_data(request, kw["slug"])
        elif name == "reviews":
            meta.update(STATIC_PAGES["reviews"]); pre[_key("/reviews/", {})] = api.reviews_data(request)
        elif name == "contact":
            meta["title"] = STATIC_PAGES["contact"]["title"]; pre[_key("/contact/", {})] = api.contact_data(request)
        elif name == "list_property":
            meta["title"] = STATIC_PAGES["list_property"]["title"]; pre[_key("/landlords/list/", {})] = api.listing_data(request)
        elif name == "providers":
            meta["title"] = STATIC_PAGES["providers"]["title"]; pre[_key("/providers/", {})] = api.provider_data(request)
        elif name in STATIC_PAGES:
            meta.update(STATIC_PAGES[name])
        else:
            raise Http404
    except Http404:
        status = 404
        meta.update(title="Page not found | AMOXHomes")
    return status, meta, pre

def _head(meta, boot, pre, request):
    host = f"{request.scheme}://{request.get_host()}"
    image = meta["image"] or f"{host}{boot['assets'].get('og', '/static/core/og.jpg')}"
    h = [f"<title>{escape(meta['title'])}</title>", f'<meta name="description" content="{escape(meta["desc"])}">',
         f'<meta property="og:title" content="{escape(meta["ogtitle"])}">', f'<meta property="og:image" content="{escape(image)}">']
    if meta["preload_hero"]:
        a = boot["assets"]
        h.append(f'<link rel="preload" as="image" href="{a["hero_mobile"]}" media="(max-width:767px)" fetchpriority="high">')
        h.append(f'<link rel="preload" as="image" href="{a["hero_desktop"]}" media="(min-width:768px)" fetchpriority="high">')
    h.append(json_script(boot, "amox-boot")); h.append(json_script(pre, "amox-preload"))
    return "".join(h)

@ensure_csrf_cookie
def spa(request, **kwargs):
    try: html = INDEX.read_text(encoding="utf-8")
    except FileNotFoundError:
        return HttpResponse("Frontend not built yet. Run:  cd frontend && npm install && npm run build",
                            status=503, content_type="text/plain")
    m = resolve(request.path_info)
    if m.url_name == "request" and m.kwargs["kind"] not in SERVICES: return redirect("/services/")
    status, meta, pre = _page(request)
    boot = api.boot_data(request); boot["assets"]["og"] = api._static("core/og.jpg")
    html = html.replace("<!--AMOX_HEAD-->", _head(meta, boot, pre, request))
    return HttpResponse(html, status=status)
