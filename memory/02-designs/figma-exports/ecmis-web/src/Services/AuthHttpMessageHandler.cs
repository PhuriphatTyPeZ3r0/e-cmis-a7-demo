using System.Net;
using System.Net.Http.Headers;

namespace EcmisWeb.Services;

/// <summary>
/// Proactive token refresh + redirect to /login on 401 for authenticated admin API calls.
/// </summary>
public sealed class AuthHttpMessageHandler(
    SessionService session,
    AuthRedirectService redirect) : DelegatingHandler
{
    protected override async Task<HttpResponseMessage> SendAsync(
        HttpRequestMessage request,
        CancellationToken cancellationToken)
    {
        var path = request.RequestUri?.AbsolutePath ?? "";

        if (!IsAnonymousPath(path))
        {
            if (!await session.EnsureValidSessionAsync())
            {
                await redirect.RedirectToLoginAsync("session-expired");
                return new HttpResponseMessage(HttpStatusCode.Unauthorized);
            }

            if (!await AttachBearerAsync(request))
            {
                await redirect.RedirectToLoginAsync("session-expired");
                return new HttpResponseMessage(HttpStatusCode.Unauthorized);
            }
        }

        var response = await base.SendAsync(request, cancellationToken);

        if (response.StatusCode == HttpStatusCode.Unauthorized && !IsAnonymousPath(path))
        {
            response.Dispose();
            if (await session.TryRefreshAsync() && await AttachBearerAsync(request))
            {
                response = await base.SendAsync(request, cancellationToken);
                if (response.StatusCode != HttpStatusCode.Unauthorized)
                    return response;
            }

            await redirect.RedirectToLoginAsync("session-expired");
            return new HttpResponseMessage(HttpStatusCode.Unauthorized);
        }

        return response;
    }

    private async Task<bool> AttachBearerAsync(HttpRequestMessage request)
    {
        var token = await session.GetAccessTokenAsync();
        if (string.IsNullOrWhiteSpace(token))
            return false;

        var tokenType = await session.GetTokenTypeAsync() ?? "Bearer";
        request.Headers.Authorization = new AuthenticationHeaderValue(tokenType, token);
        return true;
    }

    private static bool IsAnonymousPath(string path) => PublicApiPaths.IsAnonymousApiPath(path);
}
