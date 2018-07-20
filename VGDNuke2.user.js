/*******************************************************************************
Jeg er ingen stor koder, men i rein forargelse over enkelte VGD-troll har jeg
med mye kaffe og mye googling satt sammen et lite brukerskript for å slippe å
gå fullstendig fra vettet:
VGDNuke legger til to knapper på alle brukerprofiler: «Blokker innlegg» og
«Blokker sitater». Det burde være ganske selvforklarende, men merk at
sistnevnte bare fanger opp siteringer som er gjort på riktig måte via
sitatknappen.
På din egen profil finner du i tillegg nederst en liste over alle blokkeringer
du har gjort, samt en knapp for å tømme blokkeringslista helt.
Jeg har testa det på Mac i Chrome og Safari (med tillegget Tampermonkey --
https://tampermonkey.net/) og i Firefox (med tillegget Greasemonkey --
https://addons.mozilla.org/en-US/firefox/addon/greasemonkey/), og det funker som
en drøm.
  Installasjon:
1. Installer et brukerskripttillegg i nettleseren din, for eksempel et av de to
ovennevnte.
2. Når du har installert Tampermonkey, Greasemonkey eller tilsvarende, skal det
holde å trykke på «raw» oppe til høyre på denne siden (gitt at du leser dette på
GitHub) og følge instruksjonene. Hvis det ikke fungerer kan du kopiere hele
denne teksten og legge den inn i tillegget manuelt.
*******************************************************************************/

// ==UserScript==
// @name         VGDNuke2
// @version      0.2
// @author       Rhesus Kristus - update by Jallaskar
// @include      https://vgd.no/*
// @require      https://ajax.googleapis.com/ajax/libs/jquery/2.2.2/jquery.min.js
// @run-at       document-body
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_deleteValue
// ==/UserScript==

var nukeAuthorNames = GM_getValue("nukeAuthorNames");
var nukeQuotedNames = GM_getValue("nukeQuotedNames");
var profilePageName = $( ".profilePictureContainer img" ).attr('alt');

// If arrays empty, make them

if (typeof nukeAuthorNames == 'undefined') {
    nukeAuthorNames = [];
}

if (typeof nukeQuotedNames == 'undefined') {
    nukeQuotedNames = [];
}

// Remove item from array

function removeItem(array, item){
    for (var i in array) {
        if (array[i] == item) {
            array.splice(i, 1);
            break;
        }
    }
}

// arrayUnique

function arrayUnique(array) {
    var a = array.concat();
    for (var i = 0; i < a.length; ++i) {
        for (var j = i + 1; j < a.length; ++j) {
            if(a[i] === a[j])
                a.splice(j--, 1);
        }
    }

    return a;
}

// Remove posts by nuked authors

if (nukeAuthorNames.length > 0) {
    nukeAuthorNames.forEach(function(authorName) {
        var nukeAuthorSpans = $("span.usernick:contains(" + authorName + ")");
        nukeAuthorSpans.parentsUntil(".postList").remove ();
    });
}

// Remove posts with nuked quotes

if (nukeQuotedNames.length > 0) {
    nukeQuotedNames.forEach(function(quotedName) {
        var nukeQuotedStrongs = $("div.qCont strong:contains(" + quotedName + ")");
        nukeQuotedStrongs.parentsUntil(".postList").remove ();
    });
}

// On user profiles

if (profilePageName != null) {
    var authorIsNuked = false;
    var quotedIsNuked = false;

    // Check if nuked

    if (nukeAuthorNames.length > 0) {
        nukeAuthorNames.forEach(function(authorName) {
            if (authorName == profilePageName) { authorIsNuked = true; }
        });
    }

    if (nukeQuotedNames.length > 0) {
        nukeQuotedNames.forEach(function(quotedName) {
            if (quotedName == profilePageName) { quotedIsNuked = true; }
        });
    }

    if (authorIsNuked == true) {
        // User's posts are nuked, make clear button

        $( "#profileSummaryBox .simpleBox" ).append (
            "<br />" +
            "<p><a href=\"javascript: void();\" id=\"clearAuthor\" class=\"largeButton centerblock btn btnBgLarge\">Vis innlegg</a></p>"
        );

        document.getElementById('clearAuthor').onclick = function clearAuthor () {
            removeItem(nukeAuthorNames, profilePageName);
            GM_setValue("nukeAuthorNames", nukeAuthorNames);
            location.reload();
        };

    } else {

        // User's posts are not nuked, make nuke button

        $( "#profileSummaryBox .simpleBox" ).append (
            "<br />" +
            "<p><a href=\"javascript: void();\" id=\"nukeAuthor\" class=\"largeButton centerblock btn btnBgLarge\">Blokker innlegg</a></p>"
        );

        document.getElementById('nukeAuthor').onclick = function nukeAuthor () {
            nukeAuthorNames.push(profilePageName);
            GM_setValue("nukeAuthorNames", nukeAuthorNames);
            location.reload();
        };
    }

    if (quotedIsNuked == true) {
        // User's quotes are nuked, make clear button

        $( "#profileSummaryBox .simpleBox" ).append (
            "" +
            "<p><a href=\"javascript: void();\" id=\"clearQuoted\" " +
            "class=\"largeButton centerblock btn btnBgLarge\">Vis sitater</a></p>"
        );

        document.getElementById('clearQuoted').onclick = function clearAuthor () {
            removeItem(nukeQuotedNames, profilePageName);
            GM_setValue("nukeQuotedNames", nukeQuotedNames);
            location.reload();
        };

    } else {

        // User's quotes are not nuked, make nuke button

        $( "#profileSummaryBox .simpleBox" ).append (
            "" +
            "<p><a href=\"javascript: void();\" id=\"nukeQuoted\" " +
            "class=\"largeButton centerblock btn btnBgLarge\">Blokker sitater</a></p>"
        );

        document.getElementById('nukeQuoted').onclick = function nukeQuoted () {
            nukeQuotedNames.push(profilePageName);
            GM_setValue("nukeQuotedNames", nukeQuotedNames);
            location.reload();
        };
    }
}

// Show list of nuked users

if ($(location).attr('href') == "https://vgd.no/system/profile/") {
    $("#tabContent").append (
        "<div class=\"profileList profileListReplies\"><h2>Blokkerte brukere</h2>" +
        "<table cellpadding=\"0\" cellspacing=\"0\" border=\"0\" class=\"width100p messageList\">" +
        "<thead><tr><td>Brukernavn</td></tr></thead><tbody id=\"blockedUsers\"></tbody></table></div>"
    );

    var uniqueNames = arrayUnique(nukeAuthorNames.concat(nukeQuotedNames));

    uniqueNames.forEach(function(authorName) {
        $("#blockedUsers").append (
            "<tr><td><a href=\"https://vgd.no/profile/" + authorName + "\">" + authorName + "</a></td></tr>"
        );
    });

    $("#blockedUsers").append (
        "<tr><td class=\"listBottom\"><div class=\"pagination\">" +
        "<a href=\"javascript: void();\" id=\"unNukeAll\">Fjern alle blokkeringer</a></div></td></tr>");

    document.getElementById('unNukeAll').onclick = function unNukeAll() {
        GM_deleteValue("nukeAuthorNames");
        GM_deleteValue("nukeQuotedNames");
        location.reload();
    };
}
