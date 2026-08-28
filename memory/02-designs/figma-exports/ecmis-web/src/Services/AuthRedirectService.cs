using Microsoft.AspNetCore.Components;

namespace EcmisWeb.Services;

/// <summary>Central redirect when session is invalid or API returns 401.</summary>
public sealed class AuthRedirectService(NavigationManager nav, SessionService session)
{
    private bool _redirecting;

    public async Task RedirectToLoginAsync(string reason = "session-expired")
    {
        if (_redirecting) return;
        var path = new Uri(nav.Uri).AbsolutePath;
        if (PublicApiPaths.IsPublicAppPath(path))
            return;

        _redirecting = true;
        try
        {
            await session.ClearSessionAsync();
            var q = string.IsNullOrWhiteSpace(reason) ? "" : $"?reason={Uri.EscapeDataString(reason)}";
            nav.NavigateTo($"/login{q}", forceLoad: true);
        }
        finally
        {
            _redirecting = false;
        }
    }
}
