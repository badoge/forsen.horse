// render tooltips of sidebar elements:
document.querySelectorAll('aside [data-bs-toggle="tooltip"]').forEach(
  (elem) =>
    new bootstrap.Tooltip(elem, {
      delay: 50,
      trigger: "hover",
    })
);
