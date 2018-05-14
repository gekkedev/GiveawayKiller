// ==UserScript==
// @name         Giveaway Killer (a.k.a. Giveaway Enhancer)
// @namespace    https://github.com/gekkedev/giveawayHelperEnhancer
// @version      0.6.2
// @description  Enhances Steam key giveaways sites by lots of useful features
// @author       gekkedev
// @match        *://*.marvelousga.com/*
// @match        *://*.dupedornot.com/*
// @match        *://*.indiegala.com/*
// @match        *://*.dogebundle.com/*
// @match        *://*.giveaway.su/*
// @match        *://*.steamgifts.com/*
// @match        *://*.simplo.gg/*
// @match        *://*.giveawayhopper.com/*
// @match        *://*.cubicbundle.com/*
// @match        *://*.treasuregiveaways.com/*
// @match        *://*.goldengiveaways.org/*
// @match        *://*.bananagiveaway.com/*
// @match        *://*.gamehag.com/*
// @match        *://*.steamcommunity.com/openid/login*
// @match        *://*.steamcommunity.com/oauth/login*
// @grant        none
// @updateURL    https://raw.githubusercontent.com/gekkedev/giveawayHelperEnhancer/master/giveawayHelperEnhancer.user.js
// @downloadURL  https://raw.githubusercontent.com/gekkedev/giveawayHelperEnhancer/master/giveawayHelperEnhancer.user.js
// @require      https://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/blueimp-md5/2.10.0/js/md5.min.js
// @run-at document-end
// ==/UserScript==

(function() {
    J = jQuery.noConflict(true); //to prevent i.e. broken buttons when a site uses jquery too
    /**
    * Determine what to do for this page based on what's defined in the "config" variable
    *
    * 		hostname: String
    *			The hostname of the site we're setting the config for. Must be the same as what's defined
    *			as @match in the metadata block above.
    *
    *		googleads: Boolean
    * 			This tells us if the site we visit has ads (this refers to banners of any size). We'll then trigger the removal function for that.
    *
    *		autologin: String
    * 			This is a selector for a link which has to be visited in order to get forwarded to the login page.
    *
    *		clickables: Array of String
    * 			These are CSS Selectors which will be buttons to be clicked (in ascending order). Some may not be clickable but each click that doesn't need to be done is already a success.
    *
    */
    var removePopups = (function(){
        //console.log("removing popups!");
        removeElement("a[id^='popup']");
    });
    var fakeClickLinks = function() {
        J("form[action*='verify_click.php']").trigger("submit");
    };
    var solveGamehagUsernameCheck = function() {
        //"Kruemel" //some random user, just pick another one from the ranklist in case they block this user ;-)
    };
    scanForElement = function(ident) {
        //console.log("found " + ident + " " + jQuery(ident).length + " time(s)");console.log(jQuery(ident));
        if (J(ident).length >= 1) {
            return true;
        } else {
            //console.log('cannot find ' + ident);
            return false;
        }
    };
    hideElement = function(ident) {
        if (scanForElement(ident)) {
            J(ident).hide();
        }
    };
    removeElement = function(ident) {
        if (scanForElement(ident)) {
            J(ident).remove();
        }
    };
    var clickElement = function(ident) {
        if (scanForElement(ident)) {
            J(ident).click();
        }
    };
    var visitLink = (function(ident){
        window.location.replace(J(ident).attr("href"));
    });
    var removeGoogleAds = (function(){
        //console.log("removing google ads!");
        removeElement("ins[class*='adsbygoogle']");
        setTimeout(removeGoogleAds, 1000);
    });
  	var getEncapsedString = function(input, delimiter) {//just gets the first occurrence
        var startpos = input.indexOf(delimiter) + delimiter.length;
        var endpos = input.indexOf(delimiter, startpos);
        return input.substring(startpos, endpos)
    }
    var getRandomInt = function(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    };

    /*var autoJoinGroups = function() {
        //giveaway.su
        var groups = $("button[data-type='steam.group']");
        for (var i = 0; i < groups.length; i++) {
            var group = groups[i];
            $.get("https://steamcommunity.com/profiles/"+$("aside[data-steam-id]").data("steam-id")+"/groups/").always(function(jqXHR) {
                var regexp = new RegExp("href=\"javascript:leaveGroupPrompt\\('"+$(group).data("check")+"',", "g");
                if (jqXHR && regexp.test(jqXHR))
                    toggleActionButton(button);
                else
                    $(button).prop("disabled", false).find(".glyphicon.spin").removeClass("spin");
            });
            group.remove();
        }
    };*/
    var taskSkipper_1 = function() {//giveaway.su/varlick
        if ($("article .extension").length) {
            $("article .extension").addClass("installed");
            var timestamp = $("article .extension").data("timestamp");
            var csrf = $("article .extension").data("csrf");
            var extension = md5(timestamp+""+csrf);
            var secret = $("article .extension").data("secret");
            $.get(window.location.pathname+"?extension="+extension+"&timestamp="+timestamp+"&csrf="+csrf+(secret ? "&secret="+secret : ""), function(response) {
                $("article").replaceWith(response);
                //this is the extension version and should not depend on manual updates
                $("article").attr("extension-version", "chrome-3.4.9");//+chrome.runtime.getManifest().version);


                var button = $("#getKey a");
                var actions = 0;
                $("#actions [data-action-id]").each(function(i,el){
                    actions += parseInt($(el).data("action-id"));
                    if ($(el).find("button[data-type='steam.curator']").length) {
                        $(el).fadeOut();
                    } else if ($(el).find("button[data-type='youtube.subscribe']").length) {
                        $(el).fadeOut();
                    } else if ($(el).find("button[data-type='twitter.follow']").length) {
                        $(el).fadeOut();
                    } else if ($(el).find("button[data-type='steam.game.wishlist']").length) {
                        $(el).fadeOut();
                    } else if ($(el).find("td:contains('Invite')").length) {
                        $(el).fadeOut();
                    }
                });
                $(button).attr("href", $(button).attr("href")+"&actions="+md5(actions)).removeClass("disabled");
                $("#getKey").prepend("Giveaway Killer by gekkedev has skipped some tasks for you, because this site is trying to manipulate the Steam store and to get access over your private data. Key claiming does usually work when you have joined all the required groups. Please use the Giveaway Helper by Citrinate in order to join groups easier. Linking accounts happens at your own risk and is a possible reason of unwanted actions commited via your account (account theft, unwanted purchases, etc.) and is qualifying you for punishments regarding Steam T.O.S. violations.<br>");
            });
        }
    };
    var taskSkipper_2 = function() {//goldengiveaways
        var tasks = J("a[onclick*='task()']");
        if (tasks.length) {
            tasks.each(function(counter, element){
                J.get(element.href);
            });
            location.reload();
        } else {
            J(".giveaway-new").last().prepend("<div class='alert alert-danger'>Giveaway Killer by gekkedev has skipped some tasks for you, because this site is trying to manipulate the Steam store by asking you to follow specific curators. Doing such would qualify you for punishments regarding Steam T.O.S. violations.</div><br>");
        }
    };
    var taskSkipper_3 = function() {//bananagiveaway/bananatic
        //we can autosolve only link visiting (including facebook and youtube); 
        var tasks = J("li:has(span.icon:has(i.banicon.banicon-logo-small))");
        tasks = tasks.add(J("li:contains('FB'):contains('Like'), li:has(span.icon:has(i.banicon.banicon-facebook))"));
        tasks = tasks.add(J("li:contains('YT'):contains('Check'), li:has(span.icon:has(i.banicon.banicon-youtube))"));
        //steam group, twitter, and point collection tasks might be different
        //tasks = tasks.add(J("li:contains('Share'):contains('Twitter')"));
        //sharing on non.proprietary social media platforms
        tasks = tasks.add(J("li:contains('Share'):not(li:contains('Twitter')"));
        tasks = J.unique(tasks); //filters out any duplicates
        console.log(tasks.length + " skippable tasks found.");

      	//dig deeper, but keep the task steps together
        tasks = tasks.find("div[class='buttons']");
        var successes = 0;
        J.ajaxSetup({async:false}); //not so smooth looking but easy
        if (tasks.length) {console.log(tasks);
            tasks.each(function(counter, task){
                var youtubebutton = J("button[data-ytid]");
                if (youtubebutton.length) {//just hit the second link, since there is just one.
                    J.get(
                        getEncapsedString(J(J(task).find("button[disabled]")).attr("onclick"), "'"),
                            function(){
                                successes++;
                            }
                        );
                } else {
                    J.get( //hit the first link...
                        getEncapsedString(J(J(task).find("button:not([disabled])")).attr("onclick"), "'"),
                        function() {//...and only continue with the second link on success...
                            //which will, on success, make sure we really solved the task
                            J.get(
                                getEncapsedString(J(J(task).find("button[disabled]")).attr("onclick"), "'"),
                                function(){
                                    successes++;
                                }
                            );
                        }
                    );
                }
            });
            J.ajaxSetup({async:true});
            if (tasks.length == successes) {
                location.reload();
            } else {
                console.log("Could not solve all solveable tasks!");
            }
        } else {
            J("div[class='bottom'] span[class='status']").prepend("<div class='alert alert-danger'>Giveaway Killer by gekkedev has skipped some tasks for you, because this site is exploiting it's users by excessive ad banner usage plus making users fullfill specific tasks which generate a dozen times more revenue than what is offered to the user.</div><br>");
        }
    };

    //configuration
    var config = [
        {
            hostname: "marvelousga.com",
            ads: true,
            autologin: "a[href='?login']",
            //clickables: ["button[type=submit][name!=sg][id!=submit]"],
            //autosolve: "'div.collapse* button'"
            trigger: [removePopups, solveGamehagUsernameCheck] //fakeClickLinks
        },
        {
            hostname: "dupedornot.com",
            ads: true,
            autologin: "a[href='?login']",
            trigger: [removePopups]
        },
        {
            hostname: "dogebundle.com",
            ads: false,
            autologin: "a[href*='?page=login']"
        },
        {
            hostname: "indiegala.com",
            ads: true,
            clickables: ["button#close-socials"],
            custom: function() {J('#myModal-givform').modal('show');}
        },
        {
            hostname: "giveaway.su",
            ads: true,
            autologin: "a.steam-login",
            trigger: [taskSkipper_1],
            custom: function() {hideElement("ul.menu");}
        },
        {
            hostname: "simplo.gg",
            ads: true,
            autologin: "div.steam-button a",
            clickables: ["w-div[role=dialog] span"]
        },
        {
            hostname: "steamgifts.com",
            ads: true,
            autologin: "a.nav__sits"
        },
        {
            hostname: "chubbykeys.com",
            ads: false
        },
        {
            hostname: "giveawayhopper.com",
            ads: false,
            autologin: "a[href='?login']"
        },
        {
            hostname: "cubicbundle.com",
            ads: false,
            autologin: "a.no-login"
        },
        {
            hostname: "treasuregiveaways.com",
            clickables: ["input[onclick*=incr]"],
            custom: function() {J('form[action="?login"]').submit();}
        },
        {
            hostname: "goldengiveaways.org",
            ads: false,
            autologin: "a[href='/?login']",
            trigger: [taskSkipper_2]
        },
        {
            hostname: "bananagiveaway.com",
            ads: true,
            autologin: "a[href*='/steam/']",
            trigger: [taskSkipper_3]
        },
        {
            hostname: "gamehag.com",
            ads: true
        },
        {
            hostname: "steamcommunity.com",
            ads: false,
            clickables: ["input[type='submit']"]
        }
    ];

    //execution
    for(var i = 0; i < config.length; i++) {
        var site = config[i];

        if(document.location.hostname.split(".").splice(-2).join(".") == site.hostname) {
            if (site.ads) {
                removeGoogleAds();
                //removePopups();
                //add other ad services here if known
            }
            if (site.autologin !== undefined) {
                if (scanForElement(site.autologin)) {
                    console.log('performing autologin');
                    visitLink(site.autologin);
                }
            }
            if (site.clickables !== undefined) {
                if (site.clickables.length > 0) {
                    for(var j = 0; j < site.clickables.length; j++) {
                        if (J.isArray(site.clickables[j])) {
                            j = getRandomInt(0, site.clickables[j].length);
                            console.log("picking the entry " + j);
                        }
                        clickElement(site.clickables[j]);
                    }
                }
            }
            if (site.trigger !== undefined) {
                for(var j = 0; j < site.trigger.length; j++) {
                    site.trigger[j]();
                }
            }
            if (site.custom !== undefined) {
                site.custom();
            }
        }
    }
})();
