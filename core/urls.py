from django.urls import path, re_path
from django.views.generic import RedirectView
from . import console as c
from .spa import spa

# Public pages are rendered by the React app. These routes keep the same URLs and the same
# names (used by the sitemap and the models) and all point to the one `spa` view.
urlpatterns = [
    path("", spa, name="home"),
    path("houses/", spa, name="houses"),
    path("houses/near/<slug:institution>/", spa, name="houses_near"),
    path("houses/<slug:slug>/", spa, name="property_detail"),
    path("services/", spa, name="services"),
    path("request/<slug:kind>/", spa, name="request"),
    path("landlords/", spa, name="landlords"),
    path("landlords/list/", spa, name="list_property"),
    path("providers/", spa, name="providers"),
    path("about/", spa, name="about"),
    path("contact/", spa, name="contact"),
    path("thanks/", spa, name="thanks"),
    path("reviews/", spa, name="reviews"),
    path("blog/", spa, name="blog"),
    path("blog/<slug:slug>/", spa, name="blog_detail"),
    path("privacy/", spa, name="privacy"),
    path("terms/", spa, name="terms"),
    path("dashboard/", RedirectView.as_view(pattern_name="console")),
    path("console/", c.home, name="console"),
    path("console/login/", c.login_view, name="console_login"),
    path("console/logout/", c.logout_view, name="console_logout"),
    path("console/leads/", c.leads, name="console_leads"),
    path("console/leads/<int:pk>/", c.lead_update, name="console_lead_update"),
    path("console/houses/", c.props, name="console_props"),
    path("console/houses/<int:pk>/", c.prop_action, name="console_prop_action"),
    path("console/areas/", c.areas, name="console_areas"),
    path("console/areas/<int:pk>/", c.area_action, name="console_area_action"),
    path("console/announcements/", c.announcements, name="console_announcements"),
    path("console/announcements/<int:pk>/", c.announcement_action, name="console_announcement_action"),
    path("console/reviews/", c.reviews, name="console_reviews"),
    path("console/reviews/<int:pk>/", c.review_action, name="console_review_action"),
    path("console/blog/", c.blog, name="console_blog"),
    path("console/blog/new/", c.blog_edit, name="console_blog_new"),
    path("console/blog/<int:pk>/edit/", c.blog_edit, name="console_blog_edit"),
    path("console/blog/<int:pk>/", c.blog_action, name="console_blog_action"),
    path("console/partners/", c.providers, name="console_providers"),
    path("console/partners/<int:pk>/", c.provider_action, name="console_provider_action"),
    # anything else that is not an admin/api/media/static/sitemap path -> React shows its "Page not found"
    re_path(r"^(?!admin/|api/|media/|static/|sitemap\.xml|console/).*$", spa, name="notfound"),
]
