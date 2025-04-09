// Tells the Stream Deck to open a site
function openPage(site) {
    if (!site.startsWith("http")) {
        site = "https://" + site; // Ensure it has a proper URL scheme
    }
    window.open(site, "_blank");
}