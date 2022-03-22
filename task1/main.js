/*Author: vysnia121*/

init();

function init()
{
    window.onload = function()
    {
        doMagic();
        let x = document.querySelector("div[data-test-id=header-tab][aria-selected='true']").parentNode.parentNode;
        var observer = new MutationObserver( entries =>
        {
            setTimeout(1000);
            doMagic();
        });
        observer.observe(x, { childList:true, subtree:true });
    }

    function doMagic()
    {
        console.clear();
        var ticketID = fetchTicketID(window.location.href);
        var allConversationsInfo = JSON.parse(httpGet("https://nordvpn.zendesk.com/api/lotus/tickets/" + ticketID + "/conversations.json?include=users"));
        var userID = getUserID(allConversationsInfo.users);
        var numberOfPublicReplies = countPublicReplies(allConversationsInfo, userID);
        //-----------------------------------------------------
        if(ticketID.length != 0)
        {
            console.log(" >> Ticket ID: " + ticketID + ";");
            console.log(" >> Public replies: " + numberOfPublicReplies + ";");
            if(numberOfPublicReplies > 0 && userID != "")
                console.log(" >> Average agent response time: " + formatTime(findResponseTime(allConversationsInfo, numberOfPublicReplies, userID)) + ".");
        }
    }
    //--------------------------------------------------------------------------------------------------
    //--------------------------------------------------------------------------------------------------
    function fetchTicketID(url)
    {
        var index = "https://nordvpn.zendesk.com/agent/tickets/".length;
        var id = "";
        //-----------------------------
        while(isNumeric(url[index]))
        {
            id += url[index];
            index++;
        }
        //----------------------------
        return id;
    }

    function isNumeric(symbol)
    {
        if (symbol >= '0' && symbol <= '9') return true;
        else return false;
    }

    function countPublicReplies(allConversationsInfo, userID)
    {
        var numberOfPublicReplies = 0;
        //------------------------------------------------------------------------------------------------------
        allConversationsInfo.conversations.forEach(element => { if((element.author_id != userID) && element.public) numberOfPublicReplies++; });
        //------------------------------------------------------------------------------------------------------
        return numberOfPublicReplies;
    }

    function getUserID(users)
    {
        var userID = "";
        //------------------------------------------------------------
        users.forEach(u => { if(u.role != "agent") userID = u.id; });
        //------------------------------------------------------------
        return userID;
    }

    function httpGet(theUrl)
    {
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.open("GET", theUrl, false);
        xmlHttp.send(null);
        return xmlHttp.responseText;
    }

    function findResponseTime(allConversationsInfo, numberOfPublicReplies, userID)
    {
        var sumOfReplyTime = 0;
        var lastUserReply = 0;
        var lastCommentFrom = 'x';
        //------------------------------------------------------------------------------------------------------
        for (let i = 0; i < allConversationsInfo.conversations.length; i++)
        {
            let element = allConversationsInfo.conversations[i];
            if((element.author_id === userID))
                if(lastCommentFrom != 'u')
                {
                    lastUserReply = element.created_at;
                    lastCommentFrom = 'u';
                }
            //-------------------------------------------------------
            if((element.author_id != userID && element.public))
                if(lastCommentFrom != 'a')
                {
                    sumOfReplyTime += (Date.parse(element.created_at) - Date.parse(lastUserReply));
                    lastCommentFrom = 'a';
                }
        }
        //------------------------------------------------------------------------------------------------------
        return sumOfReplyTime/numberOfPublicReplies;
    }

    function formatTime(duration)
    {
        var seconds = Math.floor((duration / 1000) % 60),
            minutes = Math.floor((duration / (1000 * 60)) % 60),
            hours = Math.floor((duration / (1000 * 60 * 60)));
        //-----------------------------------------------------------------
        hours = (hours < 10) ? "0" + hours : hours;
        minutes = (minutes < 10) ? "0" + minutes : minutes;
        seconds = (seconds < 10) ? "0" + seconds : seconds;
        //-----------------------------------------------------------------
        return hours + ":" + minutes + ":" + seconds;
    }
}