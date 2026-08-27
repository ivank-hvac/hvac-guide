// Shows the "invite a friend" link in the header for accounts with
// can_invite set (see /panel "Invite-gate accounts"). Kept separate from
// app.js on purpose: this is the only place in the tool that needs to know
// about login state, and app.js is already large enough without a new
// concern threaded through it.
(function () {
  fetch("/api/me")
    .then(function (r) { return r.json(); })
    .then(function (me) {
      if (me.can_invite) {
        var link = document.getElementById("inviteLink");
        if (link) link.style.display = "";
      }
    })
    .catch(function () {});
})();
