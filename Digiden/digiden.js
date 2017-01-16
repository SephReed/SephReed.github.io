// var LIGHT_MODE_ENABLED;

// function setLightMode(onOff) {
//     if(onOff !== LIGHT_MODE_ENABLED) {
//         // if(LIGHT_MODE_ENABLED != undefined)
//         //     document.body.style.transitionDuration = "0.5s";
            
//         LIGHT_MODE_ENABLED = onOff;
//         SAFE.set("LIGHT_MODE", LIGHT_MODE_ENABLED);

//         if(LIGHT_MODE_ENABLED)
//             document.body.classList.add("light_mode");

//         else 
//             document.body.classList.remove("light_mode");            
        
//     }
// }


var CURRENT_THEME;
function setTheme(theme) {
        if(theme === null)
            theme = "light_mode";

        console.log("theme!!", CURRENT_THEME, theme);

        if(CURRENT_THEME && CURRENT_THEME.length)
            document.body.classList.remove(CURRENT_THEME);   

        if(theme && theme.length)
            document.body.classList.add(theme);

        CURRENT_THEME = theme;
        SAFE.set("CURRENT_THEME", CURRENT_THEME);
    
}


document.addEventListener('DOMContentLoaded', function() {
    setTheme(SAFE.get("CURRENT_THEME"));
    // setLightMode(SAFE.get("LIGHT_MODE") != "false");    
});




// function initFromUserData() {
    
// }