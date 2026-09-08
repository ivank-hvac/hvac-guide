// Shows the "invite a friend" link for accounts with can_invite set (see
// /panel "Invite-gate accounts"), and the "session history" link for any
// logged-in account. Kept separate from app.js on purpose: this is the only
// place in the tool that needs to know about login state, and app.js is
// already large enough without a new concern threaded through it.
(function () {
  fetch("/api/me")
    .then(function (r) { return r.json(); })
    .then(function (me) {
      if (me.logged_in) {
        var historyLink = document.getElementById("historyLink");
        if (historyLink) historyLink.style.display = "";
      }
      if (me.can_invite) {
        var inviteLink = document.getElementById("inviteLink");
        if (inviteLink) inviteLink.style.display = "";
      }
    })
    .catch(function () {});
})();
