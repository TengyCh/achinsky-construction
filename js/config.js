/* ============================================================
   EmailJS configuration
   ------------------------------------------------------------
   Fill in the three values below to make the contact form send
   real emails. Until then the form validates and shows a friendly
   "not configured yet" message instead of silently failing.

   Where to get each value (all free — emailjs.com):
     1. Sign up at https://www.emailjs.com/
     2. Email Services  -> add Gmail (use Achinsky.construction@gmail.com)
                           -> copy the SERVICE ID
     3. Email Templates -> create a template
                           -> copy the TEMPLATE ID
     4. Account -> General -> copy the PUBLIC KEY

   Your template should reference these variables:
     {{first_name}} {{last_name}} {{email}} {{phone}} {{country}}
     {{address}} {{city}} {{zip}} {{project_type}} {{details}}

   NOTE: the public key is meant to be public — it is safe in this file.
   ============================================================ */

window.ACHINSKY_CONFIG = {
  EMAILJS_PUBLIC_KEY: "UdnffwjaYVDt_g22E",
  EMAILJS_SERVICE_ID: "service_navlc8u",
  EMAILJS_TEMPLATE_ID: "template_er0jnzi",

  // Shown to visitors if EmailJS isn't set up yet, so no lead is ever lost.
  FALLBACK_EMAIL: "Achinsky.construction@gmail.com"
};
