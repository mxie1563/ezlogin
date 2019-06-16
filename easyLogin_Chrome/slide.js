var slideIndex = 1;
showSlides(slideIndex);

function prevSlide() {
  plusSlides(-1);
}

function nextSlide() {
  plusSlides(1);
}

function plusSlides(n) {
  showSlides(slideIndex += n);
}

function showSlides(n) {
  var i;
  //var slides = document.getElementsByClassName("mySlides");
  var slides = document.querySelectorAll("div.mySlides");
  if (n > slides.length) {slideIndex = 1}
  if (n < 1) {slideIndex = slides.length}
  for (i = 0; i < slides.length; i++) {
      slides[i].style.display = "none";
  }
  slides[slideIndex-1].style.display = "block";
}
