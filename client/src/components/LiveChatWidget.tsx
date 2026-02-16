import { useEffect } from "react";

/**
 * Tawk.to Live Chat Widget
 * 
 * To activate this widget:
 * 1. Sign up for free at https://www.tawk.to/
 * 2. Create a new property for your website
 * 3. Get your Property ID and Widget ID from the Admin Panel > Administration > Property Settings
 * 4. Replace the placeholder IDs below with your actual IDs
 * 
 * The widget will appear as a chat bubble in the bottom-right corner of your site.
 */

export function LiveChatWidget() {
  useEffect(() => {
    // TODO: Replace these with your actual Tawk.to Property ID and Widget ID
    // Get these from: https://dashboard.tawk.to/#/admin/property-settings
    const TAWK_PROPERTY_ID = "YOUR_PROPERTY_ID_HERE"; // e.g., "5f8a1b2c3d4e5f6g7h8i9j0k"
    const TAWK_WIDGET_ID = "YOUR_WIDGET_ID_HERE"; // e.g., "1a2b3c4d5e6f"
    
    // Only load if IDs are configured
    if (TAWK_PROPERTY_ID === "YOUR_PROPERTY_ID_HERE" || TAWK_WIDGET_ID === "YOUR_WIDGET_ID_HERE") {
      console.warn("Tawk.to chat widget not configured. Please add your Property ID and Widget ID to LiveChatWidget.tsx");
      return;
    }

    // Load Tawk.to script
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://embed.tawk.to/${TAWK_PROPERTY_ID}/${TAWK_WIDGET_ID}`;
    script.charset = "UTF-8";
    script.setAttribute("crossorigin", "*");
    
    document.body.appendChild(script);

    // Cleanup function to remove script when component unmounts
    return () => {
      const tawkScript = document.querySelector(`script[src*="tawk.to"]`);
      if (tawkScript) {
        tawkScript.remove();
      }
      
      // Remove Tawk widget from DOM
      const tawkWidget = document.getElementById("tawk-bubble");
      if (tawkWidget) {
        tawkWidget.remove();
      }
    };
  }, []);

  return null; // This component doesn't render anything visible
}

/**
 * Alternative: Simple Contact Button (No External Service Required)
 * 
 * If you prefer not to use Tawk.to, you can create a simple contact button
 * that opens an email client or redirects to a contact form.
 */

export function SimpleContactButton() {
  const handleContact = () => {
    // Option 1: Open email client
    window.location.href = "mailto:corranforce@gmail.com?subject=Pathfinder Support Request";
    
    // Option 2: Open a contact form page
    // window.location.href = "/contact";
  };

  return (
    <button
      onClick={handleContact}
      className="fixed bottom-6 right-6 bg-primary text-primary-foreground rounded-full p-4 shadow-lg hover:shadow-xl transition-shadow z-50 flex items-center gap-2"
      aria-label="Contact Support"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
      <span className="hidden md:inline">Need Help?</span>
    </button>
  );
}
