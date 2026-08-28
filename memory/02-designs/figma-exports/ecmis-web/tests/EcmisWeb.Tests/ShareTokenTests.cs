using Xunit;
using EcmisWeb.Services;

namespace EcmisWeb.Tests;

public class ShareTokenTests
{
    [Fact]
    public void Created_token_roundtrips_expiry_and_is_valid()
    {
        var exp = DateTime.UtcNow.AddDays(7);
        var token = ShareToken.Create(exp);

        Assert.True(ShareToken.TryGetExpiry(token, out var parsed));
        Assert.Equal(exp, parsed, TimeSpan.FromSeconds(1));
        Assert.True(ShareToken.IsValid(token, DateTime.UtcNow));
    }

    [Fact]
    public void Expired_token_is_invalid()
    {
        var token = ShareToken.Create(DateTime.UtcNow.AddHours(-1));
        Assert.False(ShareToken.IsValid(token, DateTime.UtcNow));
    }

    [Fact]
    public void Token_is_urlsafe()
    {
        var token = ShareToken.Create(DateTime.UtcNow.AddDays(30));
        Assert.DoesNotContain('+', token);
        Assert.DoesNotContain('/', token);
        Assert.DoesNotContain('=', token);
    }

    [Theory]
    [InlineData("")]
    [InlineData("ขยะ")]
    [InlineData("not-a-token!!!")]
    [InlineData("YWJjLmRlZg")] // base64 ของ "abc.def" — ไม่ใช่ตัวเลข
    public void Garbage_token_is_invalid_without_throwing(string token)
        => Assert.False(ShareToken.IsValid(token, DateTime.UtcNow));

    [Fact]
    public void Tokens_are_unique_per_call()
        => Assert.NotEqual(ShareToken.Create(DateTime.UtcNow.AddDays(1)),
                           ShareToken.Create(DateTime.UtcNow.AddDays(1)));
}
