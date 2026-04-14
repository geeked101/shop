const themeBtn = document.getElementById("themeToggle");
const html = document.documentElement; // this is <html>

// Load saved theme
const savedTheme = localStorage.getItem("theme");
if (savedTheme === "dark") {
  html.classList.add("dark");
  themeBtn.textContent = "☀️ Light Mode";
} else {
  html.classList.remove("dark");
  themeBtn.textContent = "🌙 Dark Mode";
}

// Toggle theme on click
themeBtn.addEventListener("click", () => {
  html.classList.toggle("dark");

  const isDark = html.classList.contains("dark");
  themeBtn.textContent = isDark ? "☀️ Light Mode" : "🌙 Dark Mode";
  localStorage.setItem("theme", isDark ? "dark" : "light");
});
