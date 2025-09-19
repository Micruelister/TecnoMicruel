// =================================================================
// FILE: main.js (FULL AND TRANSLATED VERSION)
// =================================================================

// This code will execute once all the content of the page has been loaded.
document.addEventListener('DOMContentLoaded', (event) => {
    
    // 1. Find all elements that have the 'alert' class.
    //    querySelectorAll returns a list of all flash messages currently displayed.
    const flashMessages = document.querySelectorAll('.alert');
    
    // 2. If any messages were found...
    if (flashMessages) {
        
        // 3. Iterate over each of the found messages.
        flashMessages.forEach(function(message) {
            
            // 4. Use setTimeout to execute an action after a delay.
            //    5000 milliseconds = 5 seconds.
            setTimeout(function() {
                // 5. Add a 'fade-out' class to the message.
                //    This will trigger our CSS animation.
                message.classList.add('fade-out');
            }, 5000); // The message will start fading out after 5 seconds.

            // 6. Optional: After the animation finishes, remove the element completely from the DOM.
            //    The animation duration is 0.5 seconds (500ms).
            setTimeout(function() {
                message.remove(); // This cleans up the HTML.
            }, 5500); // 5000ms wait + 500ms animation.
        });
    }
});