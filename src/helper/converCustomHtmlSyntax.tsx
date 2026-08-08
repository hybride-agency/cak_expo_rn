// Helper function to convert custom color syntax to HTML
const convertCustomHtmlSyntax = (text: string) => {
        if (!text) return '<p>No title available</p>';
    
        // Convert %{color:#hexcode}text% to <span style="color:#hexcode">text</span>
        let converted = text.replace(
      /%\{color:(#[0-9A-Fa-f]{6})\}([^%]+)%/g,
      '<span style="color:$1;">$2</span>',
    );
  
    // Remove any remaining % characters
    converted = converted.replace(/%/g, '');
  
    return `<p>${converted}</p>`;
  };

  export default convertCustomHtmlSyntax;