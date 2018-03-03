/**
 * Register a
 * ServiceWorker
 */
if(navigator.serviceWorker){
    navigator.serviceWorker.register('/sw.js', {scope: './'})
    .then((reg) => {
        console.log("Service worker has been successfully registered.");      
    }).catch((err) => {
        console.log("error " , err);      
    });
}