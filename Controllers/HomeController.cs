using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using MonitorRTC.Models;
using MonitorRTC.Data;
using MonitorRTC.Models.UserModel;
using System.Diagnostics;
using System.Security.Cryptography;

namespace MonitorRTC.Controllers
{
    public class HomeController : Controller
    {
        private readonly ILogger<HomeController> _logger;
        private readonly ApplicationDbContext _dbContext;

        // In-memory user list for demo purposes
        private static List<UserModel> _users = new List<UserModel>();

        // Inject ApplicationDbContext into the constructor
        public HomeController(ILogger<HomeController> logger, ApplicationDbContext dbContext)
        {
            _logger = logger;
            _dbContext = dbContext; // Initialize _dbContext
        }

        // Index Page
        public IActionResult Index()
        {
            return View();
        }

        // Signup (GET)
        public IActionResult Signup()
        {
            return View();
        }

        // Signup (POST)
        [HttpPost]
        public IActionResult Signup(UserModel user)
        {
            if (ModelState.IsValid)
            {
                try
                {
                    // Check if the email already exists in the database
                    var existingUser = _dbContext.Users.FirstOrDefault(u => u.Email == user.Email);

                    if (existingUser != null)
                    {
                        // If the user already exists, add an error to the ModelState
                        _logger.LogInformation("An account with this email already exists.");
                        ModelState.AddModelError("Email", "An account with this email already exists.");
                        return View(user); // Return to the view with the error message
                    }

                    // Encrypt the user's password
                    user.Password = AES256Encryption.Encrypt(user.Password);

                    // Generate the token (now done in the controller, not the form)
                    user.Token = user.GenerateToken();

                    // Save the new user to the database
                    _dbContext.Users.Add(user);
                    _dbContext.SaveChanges();

                    // Redirect to the login page after successful signup
                    return RedirectToAction("Login");
                }
                catch (Exception ex)
                {
                    // Log the error and display a user-friendly message
                    _logger.LogError(ex, "An error occurred while processing the signup.");
                    ModelState.AddModelError("", "An error occurred while processing your request. Please try again.");
                    return RedirectToAction("Index");
                }
            }
            else
            {
                foreach (var error in ModelState.Values.SelectMany(v => v.Errors))
                {
                    Console.WriteLine(error.ErrorMessage);
                }


            }

            // If the model state is invalid, return to the signup page with validation errors
            return View(user);
        }

        // Login (GET)
        public IActionResult Login()
        {
            return View();
        }
        [HttpPost]
        public IActionResult Login(UserModel user)
        {
            try
            {

                // Check if the user exists in the system
                var existingUser = _dbContext.Users.FirstOrDefault(u => u.Email == user.Email);

                if (existingUser == null)
                {
                    _logger.LogError("Error: User with email {Email} does not exist.", user.Email);
                    ViewBag.ErrorMessage = "Account does not exist.";
                    return View(); // Return the view with an error message for non-existent account
                }

                // Check if the password is correct
                var decryptedPassword = AES256Encryption.Decrypt(existingUser.Password); // Decrypt the stored password
                if (user.Password != decryptedPassword)
                {
                    _logger.LogError("Error: Incorrect password for user with email {Email}.", user.Email);
                    ViewBag.ErrorMessage = "Invalid email or password.";
                    return View(); // Return the view with an error message for incorrect password
                }

                // If user exists and password matches
                _logger.LogInformation("User {Email} logged in successfully.", user.Email);
                HttpContext.Session.SetString("LoggedInUser", user.Email); // Save user email in session
                Console.WriteLine("user is => " + HttpContext.Session.GetString("LoggedInUser"));
                Setter_Getter.Email = user.Email;
                TempData["WelcomeMessage"] = $"Welcome, {existingUser.Name}!";
                return RedirectToAction("Dashboard"); // Redirect to the Dashboard after successful login


            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while processing the Login.");
                ModelState.AddModelError("", "An error occurred while processing your request. Please try again.");
                return View(user);
            }
        }



        // Logout
        public IActionResult Logout()
        {
            HttpContext.Session.Remove("LoggedInUser"); // Remove user from session
            TempData["SuccessMessage"] = "You have been logged out.";
            return RedirectToAction("Index");
        }

        // Dashboard
        public IActionResult Dashboard()
        {
            if (HttpContext.Session.GetString("LoggedInUser") == null)
            {
                Console.WriteLine("user is => " + HttpContext.Session.GetString("LoggedInUser"));

                TempData["ErrorMessage"] = "Please log in to access the dashboard.";
                return RedirectToAction("Login");
            }

            ViewBag.WelcomeMessage = TempData["WelcomeMessage"];
            return View();
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}
