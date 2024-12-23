using System;
using System.Security.Cryptography;
using System.Text;

namespace MonitorRTC.Models.UserModel
{
    public class UserModel
    {
        public int Id { get; set; }

        // User properties
        public string Name { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }

        // Token will be set in the controller, no need to initialize it here
        // Making the Token property optional
        public string? Token { get; set; }  // Make Token nullable (optional)

        // Method to generate a 32-character random token (no need to call it from the model, do it in the controller)
        public string GenerateToken()
        {
            return GenerateRandomToken();
        }

        // Helper method to generate a random token
        private string GenerateRandomToken()
        {
            using (var rng = new RNGCryptoServiceProvider())
            {
                byte[] tokenBytes = new byte[24]; // 24 bytes will result in a 32-character base64 string
                rng.GetBytes(tokenBytes);

                // Generate the token and replace any '/' character with '_'
                string base64Token = Convert.ToBase64String(tokenBytes);

                // Replace characters to ensure URL safety and remove '/'
                string token = base64Token.Replace("/", "_").Replace("+", "-").Substring(0, 32);

                return token;
            }
        }
    }
}
