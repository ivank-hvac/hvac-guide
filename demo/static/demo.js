// Checklist progress counter — event delegation on document, not a
// per-checkbox inline onchange="..." and not an inline <script> block.
// Both of those got silently blocked once the demo app picked up the same
// CSP as the main app (script-src 'self', no 'unsafe-inline') — found
// live on the real public domain right after shipping the headers fix,
// 9 Oct 2026 (see CLAUDE.md "Публичная демо-витрина"). An external file
// loaded from the same origin satisfies script-src 'self' as-is.
document.addEventListener("change", function (e) {
  var item = e.target.closest(".checklist-item");
  if (!item) return;
  var wrap = item.closest(".checklist");
  if (!wrap) return;
  var total = wrap.querySelectorAll(".checklist-item").length;
  var done = wrap.querySelectorAll(
    ".checklist-item input[type=checkbox]:checked"
  ).length;
  wrap.querySelector(".checklist-progress").textContent =
    "Completed: " + done + " of " + total;
});
