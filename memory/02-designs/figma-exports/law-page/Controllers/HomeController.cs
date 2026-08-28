using Microsoft.AspNetCore.Mvc;

namespace law_page.Controllers
{
    public class HomeController : Controller
    {
        [Route("")]
        [Route("court-cases")]
        [Route("court-cases/dashboard")]
        [Route("court-cases/prosecution-court")]
        [Route("court-cases/prosecution-court/detail")]
        [Route("court-cases/disclosure")]
        [Route("court-cases/disclosure/detail")]
        [Route("court-cases/administrative")]
        [Route("court-cases/administrative/detail")]
        [Route("analysis/poc")]
        [Route("analysis/components-demo")]
        public IActionResult Index()
        {
            return View();
        }
    }
}
