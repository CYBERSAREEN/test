require("dotenv").config();
const express = require("express");
const path = require("path");
const axios = require("axios");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
// Static files — serves public/ and also the root images/ folder
app.use(express.static(path.join(__dirname, "public")));
app.use("/images", express.static(path.join(__dirname, "images")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Reviews cache (5-min TTL) ──────────────────────────────
let reviewsCache = null;
let reviewsCacheAt = 0;
const CACHE_TTL = 5 * 60 * 1000;

// ─── Mock fallback ───────────────────────────────────────────
function getMockReviews() {
  return [
    {
      author_name: "Priya Sharma",
      rating: 5,
      text: "Joining The Raw Studios was the best decision I made for my daughter. After just 4 months of singing with Rounak sir, she performed solo at her school annual function. The personalized attention and structured curriculum make all the difference!",
      profile_photo_url:
        "https://ui-avatars.com/api/?name=Priya+Sharma&background=FA8112&color=fff&size=60&rounded=true",
      relative_time_description: "2 months ago",
    },
    {
      author_name: "Amit Verma",
      rating: 5,
      text: "Vedant sir's flute lessons are nothing short of magical. I had zero musical background and within 6 months I can play full ragas. The studio atmosphere is welcoming — best music academy in the tricity area!",
      profile_photo_url:
        "https://ui-avatars.com/api/?name=Amit+Verma&background=222222&color=fff&size=60&rounded=true",
      relative_time_description: "1 month ago",
    },
    {
      author_name: "Neha Kapoor",
      rating: 5,
      text: "Lakshay sir transformed my daughter's posture, grace, and confidence through Kathak. The annual auditorium concert was breathtaking — every student performed with professional-level poise. TRS is truly a gem in Zirakpur.",
      profile_photo_url:
        "https://ui-avatars.com/api/?name=Neha+Kapoor&background=FA8112&color=fff&size=60&rounded=true",
      relative_time_description: "3 weeks ago",
    },
    {
      author_name: "Rajesh Gupta",
      rating: 5,
      text: "My son started guitar here a year ago and performed at his school's annual function to a standing ovation. What impresses me most is how TRS builds confidence alongside technical skill. Rounak sir is an incredible mentor!",
      profile_photo_url:
        "https://ui-avatars.com/api/?name=Rajesh+Gupta&background=222222&color=fff&size=60&rounded=true",
      relative_time_description: "5 days ago",
    },
    {
      author_name: "Sunita Mehta",
      rating: 5,
      text: "The yoga and wellness sessions by Lakshay sir have genuinely changed my quality of life. I battled chronic back pain for years — 3 months into the program I feel like a new person. Peaceful, professional, and inspiring studio.",
      profile_photo_url:
        "https://ui-avatars.com/api/?name=Sunita+Mehta&background=FA8112&color=fff&size=60&rounded=true",
      relative_time_description: "1 week ago",
    },
    {
      author_name: "Arjun Singh",
      rating: 5,
      text: "Bhangra at TRS is pure energy! Lakshay sir brings expert choreography and infectious enthusiasm to every class. Our batch performed at the Punjab Youth Festival and won second place — couldn't have done it without this incredible team.",
      profile_photo_url:
        "https://ui-avatars.com/api/?name=Arjun+Singh&background=222222&color=fff&size=60&rounded=true",
      relative_time_description: "2 weeks ago",
    },
    {
      author_name: "Kavita Nair",
      rating: 5,
      text: "I enrolled my twins — one in piano, one in sitar — and both have flourished beyond my expectations. TRS creates such an authentic love for music, not just mechanical skill. Vedant sir and Rounak sir are exceptional educators.",
      profile_photo_url:
        "https://ui-avatars.com/api/?name=Kavita+Nair&background=FA8112&color=fff&size=60&rounded=true",
      relative_time_description: "3 months ago",
    },
    {
      author_name: "Harpreet Sandhu",
      rating: 5,
      text: "From the very first trial lesson, I knew TRS was different. The faculty listens to what you want to achieve and builds a customized learning path. My drums journey with Vedant sir has been nothing short of exhilarating — 100% recommend!",
      profile_photo_url:
        "https://ui-avatars.com/api/?name=Harpreet+Sandhu&background=222222&color=fff&size=60&rounded=true",
      relative_time_description: "1 month ago",
    },
  ];
}

// ─── Live Google Places fetch ────────────────────────────────
// To enable live reviews:
//   1. Create a Google Cloud project & enable Places API
//   2. Set GOOGLE_API_KEY in .env
//   3. Find your Place ID: https://developers.google.com/maps/documentation/javascript/examples/places-placeid-finder
//   4. Set GOOGLE_PLACE_ID in .env  (looks like: ChIJN1t_tDeuEmsRUsoyG83frY4)
async function fetchGoogleReviews() {
  const apiKey = process.env.GOOGLE_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID;

  // Return cache if fresh
  if (reviewsCache && Date.now() - reviewsCacheAt < CACHE_TTL) {
    console.log("📦 Reviews served from cache");
    return reviewsCache;
  }

  if (
    !apiKey ||
    !placeId ||
    apiKey === "your_google_places_api_key" ||
    placeId === "your_google_place_id"
  ) {
    console.log(
      "ℹ️  No Google API keys — using demo reviews. Set GOOGLE_API_KEY + GOOGLE_PLACE_ID in .env for live data.",
    );
    return getMockReviews();
  }

  try {
    console.log("🌐 Fetching live Google reviews...");
    const { data } = await axios.get(
      "https://maps.googleapis.com/maps/api/place/details/json",
      {
        params: {
          place_id: placeId,
          fields: "reviews,rating,user_ratings_total,name",
          key: apiKey,
          reviews_sort: "newest",
        },
        timeout: 8000,
      },
    );

    if (data.status !== "OK") {
      console.warn(
        `⚠️  Places API returned status: ${data.status}. Using demo reviews.`,
      );
      return getMockReviews();
    }

    const raw = data.result?.reviews || [];
    const filtered = raw.filter((r) => r.rating >= 4);
    const reviews = filtered.length >= 3 ? filtered : getMockReviews();

    // Cache
    reviewsCache = reviews;
    reviewsCacheAt = Date.now();
    console.log(`✅ Fetched ${reviews.length} live reviews from Google`);
    return reviews;
  } catch (err) {
    console.warn(
      `⚠️  Google Places API error: ${err.message}. Using demo reviews.`,
    );
    return getMockReviews();
  }
}

// ─── Data ─────────────────────────────────────────────────────
// Course images should be placed at public/images/courses/<filename>.jpg
const coursesData = [
  {
    id: 1,
    title: "Singing Classes",
    instructor: "Rounak Sir",
    category: "music",
    icon: "fa-microphone",
    price: "₹2,499",
    desc: "Professional singing classes with Rounak Singh in Zirakpur. Learn classical and modern vocal techniques, singing lessons for all ages. Best vocal training academy in tri-city.",
    image: "/images/courses/singing.jpg",
  },
  {
    id: 2,
    title: "Guitar Classes",
    instructor: "Rounak Sir",
    category: "music",
    icon: "fa-guitar",
    price: "₹2,499",
    desc: "Expert guitar classes by Rounak Singh in Zirakpur. Master acoustic and electric guitar with structured lessons. Professional guitar training in tri-city area.",
    image: "/images/courses/guitar.jpg",
  },
  {
    id: 3,
    title: "Piano Classes",
    instructor: "Rounak Sir",
    category: "music",
    icon: "fa-music",
    price: "₹2,499",
    desc: "Piano classes in Zirakpur with Rounak Sir. Build strong piano skills with classical and modern training. Professional piano lessons in tri-city.",
    image: "/images/courses/piano.jpg",
  },
  {
    id: 4,
    title: "Flute Classes",
    instructor: "Vedant Sir",
    category: "music",
    icon: "fa-wind",
    price: "₹2,499",
    desc: "Flute classes by Vedant Sareen in Zirakpur and Ludhiana. Explore the art of flute with guided professional instruction. Best flute lessons in tri-city.",
    image: "/images/courses/flute.jpg",
  },
  {
    id: 5,
    title: "Drums Classes",
    instructor: "Vedant Sir",
    category: "music",
    icon: "fa-drum",
    price: "₹4,000",
    desc: "Drum classes with Vedant Sareen in Zirakpur. Master rhythm and beats with dynamic drum lessons. Professional drum training academy in tri-city.",
    image: "/images/courses/drums.jpg",
  },
  {
    id: 6,
    title: "Clapbox Classes",
    instructor: "Vedant Sir",
    category: "music",
    icon: "fa-box",
    price: "₹2,499",
    desc: "Clapbox classes by Vedant Sareen. Learn percussive groove and hand drum techniques. Professional clapbox lessons in Zirakpur and Ludhiana.",
    image: "/images/courses/clapbox.jpg",
  },
  {
    id: 7,
    title: "Violin Classes",
    instructor: "Vedant Sir",
    category: "music",
    icon: "fa-sliders",
    price: "₹3,000",
    desc: "Violin classes by Vedant Sareen in Zirakpur. Master the strings with classical and contemporary violin lessons. Professional violin training in tri-city.",
    image: "/images/courses/violin.jpg",
  },
  {
    id: 8,
    title: "Sitar Classes",
    instructor: "Vedant Sir",
    category: "music",
    icon: "fa-circle-nodes",
    price: "₹3,000",
    desc: "Sitar classes with Vedant Sareen. Explore the depth of Indian classical music through sitar. Professional sitar lessons in Zirakpur and Ludhiana.",
    image: "/images/courses/sitar.jpg",
  },
  {
    id: 9,
    title: "Classical Dance - Kathak",
    instructor: "Lakshay Sir",
    category: "dance",
    icon: "fa-star",
    price: "₹2,499",
    desc: "Classical dance and Kathak classes with Lakshay. Learn traditional Indian dance forms and graceful expressions. Professional Kathak training in Zirakpur.",
    image: "/images/courses/classicaldance.jpg",
  },
  {
    id: 10,
    title: "Bhangra Dance Classes",
    instructor: "Neha Mam",
    category: "dance",
    icon: "fa-fire",
    price: "₹2,499",
    desc: "Bhangra dance classes in Zirakpur. High-energy folk dance and rhythmic movements. Learn authentic Bhangra with professional instructors in tri-city.",
    image: "/images/courses/bhangra.jpg",
  },
  {
    id: 11,
    title: "Western Dance Classes",
    instructor: "Neha Mam",
    category: "dance",
    icon: "fa-person-walking",
    price: "₹2,499",
    desc: "Western dance classes in Zirakpur. Urban dance styles and creative choreography. Professional contemporary and western dance training.",
    image: "/images/courses/western-dance.jpg",
  },
  {
    id: 12,
    title: "Yoga Classes",
    instructor: "Monika",
    category: "dance",
    icon: "fa-spa",
    price: "₹2,499",
    desc: "Yoga and wellness classes in Zirakpur. Balance your mind and body through strength and flow. Holistic health and fitness training.",
    image: "/images/courses/yoga.jpg",
  },
];

const labelVideos = [
  {
    id: "d2bU-zANIH8",
    title:
      "Baat Itni Si Hai |Love is Feeling| Official Song | Rounak Singh | Sobia Kaur | Raw Studios",
    artist: "Rounak Singh ft. Sobia Kaur",
    type: "recorded",
  },
  {
    id: "2VraEY8XMdw",
    title: "Superstar ( Full song) Rounak Singh",
    artist: "Rounak Singh",
    type: "recorded",
  },
  {
    id: "KnWLEZc0hQc",
    title:
      "Rounak Singh : Chal Ud Challiye | Lets Fly | Ft Yasmeen | Latest Song | Official Video",
    artist: "Rounak Singh ft. Yasmeen",
    type: "recorded",
  },
];

// ─── Routes ───────────────────────────────────────────────────
function isLive() {
  const key = process.env.GOOGLE_API_KEY;
  const pid = process.env.GOOGLE_PLACE_ID;
  return !!(
    key &&
    pid &&
    key !== "your_google_places_api_key" &&
    pid !== "your_google_place_id"
  );
}

app.get("/", async (req, res) => {
  const reviews = await fetchGoogleReviews();
  res.render("index", {
    title:
      "Music & Dance Classes in Zirakpur | Rounak Singh, Vedant Sareen | The Raw Studios",
    description:
      "Best music and dance classes in Zirakpur, Ludhiana, Chandigarh. Learn singing, guitar, piano, flute, drums, violin, sitar, clapbox, classical dance, bhangra from expert instructors Rounak Singh, Vedant Sareen, and Lakshay.",
    keywords:
      "music classes, dance classes, singing classes, guitar classes, piano classes, music academy, dance academy, Rounak Singh classes, Vedant Sareen flute, Lakshay dance, Zirakpur, tri-city, Chandigarh",
    ogTitle: "Music & Dance Academy in Zirakpur | The Raw Studios",
    ogDescription:
      "Professional music and dance classes with Rounak Singh, Vedant Sareen, and Lakshay. Guitar, singing, flute, drums, violin, sitar, kathak, bhangra in Zirakpur.",
    canonical: "https://rawstudios.co/",
    reviews,
    courses: coursesData.slice(0, 4),
    live: isLive(),
  });
});
app.get("/courses", (req, res) => {
  res.render("courses", {
    title:
      "Music & Dance Courses | Guitar, Singing, Flute, Drums, Violin, Sitar, Kathak | The Raw Studios",
    description:
      "Explore our comprehensive music and dance courses. Guitar classes, singing lessons, flute classes, drum lessons, violin classes, sitar classes, clapbox, classical dance, bhangra, western dance in Zirakpur and tri-city.",
    keywords:
      "guitar classes, singing classes, flute classes, drum classes, violin classes, sitar classes, piano classes, kathak classes, bhangra classes, music courses, dance courses, Zirakpur, Rounak Singh, Vedant Sareen",
    ogTitle: "All Music & Dance Courses | The Raw Studios",
    ogDescription:
      "Professional courses in guitar, singing, flute, drums, violin, sitar, clapbox, classical dance, bhangra, western dance, yoga. Enroll now!",
    canonical: "https://rawstudios.co/courses",
    courses: coursesData,
  });
});
app.get("/label", (req, res) => {
  res.render("label", {
    title:
      "Rounak Singh Live Performances & Recordings | The Raw Studios Label",
    description:
      "Watch live performances and recorded videos of Rounak Singh and Raw Studios label artists. Music performances, singing videos, and professional recordings.",
    keywords:
      "Rounak Singh music, Rounak Singh live, Rounak Singh videos, Raw Studios label, music performances, singing videos",
    ogTitle: "Label & Performances | The Raw Studios",
    ogDescription:
      "Explore live performances and professional recordings from Rounak Singh and Raw Studios label.",
    canonical: "https://rawstudios.co/label",
    liveVideos: labelVideos.filter((v) => v.type === "live"),
    recordedVideos: labelVideos.filter((v) => v.type === "recorded"),
  });
});
app.get("/about", async (req, res) => {
  const reviews = await fetchGoogleReviews();
  res.render("about", {
    title: "About The Raw Studios | Music & Dance Academy Zirakpur",
    description:
      "Learn about The Raw Studios, a premier music and dance academy in Zirakpur established by Rounak Singh. Expert instructors in singing, guitar, flute, drums, violin, sitar, kathak, bhangra.",
    keywords:
      "about Raw Studios, Rounak Singh, Vedant Sareen, Lakshay, music academy, dance academy, Zirakpur, tri-city, music education",
    ogTitle: "About The Raw Studios | Music Academy",
    ogDescription:
      "Premier music and dance academy in Zirakpur with expert instructors Rounak Singh, Vedant Sareen, and Lakshay.",
    canonical: "https://rawstudios.co/about",
    reviews,
    live: isLive(),
  });
});
app.get("/contact", (req, res) => {
  res.render("contact", {
    title: "Contact The Raw Studios | Music Classes Zirakpur",
    description:
      "Get in touch with The Raw Studios for music and dance classes in Zirakpur. Call us for singing, guitar, flute, drums, violin, sitar classes.",
    keywords:
      "contact, music classes, dance classes, Zirakpur, Rounak Singh, Vedant Sareen, book trial, enroll",
    ogTitle: "Contact Us | The Raw Studios",
    ogDescription:
      "Contact The Raw Studios to book trial classes or enroll in music and dance courses.",
    canonical: "https://rawstudios.co/contact",
    success: null,
    error: null,
  });
});

// ─── API: list image files in public/images/ ─────────────────
app.get("/api/images", (req, res) => {
  try {
    const imagesDir = path.join(__dirname, "public", "images");
    const files = fs
      .readdirSync(imagesDir)
      .filter((f) => /\.(jpe?g|png|gif|webp|svg|avif)$/i.test(f));
    res.json({ count: files.length, images: files });
  } catch (err) {
    res.json({ count: 0, images: [], error: err.message });
  }
});

// Debug endpoint — hit /api/reviews to check what's returning
app.get("/api/reviews", async (req, res) => {
  const reviews = await fetchGoogleReviews();
  res.json({ count: reviews.length, live: isLive(), reviews });
});

app.post("/contact", (req, res) => {
  res.render("contact", {
    title: "Contact Us — The Raw Studios",
    success:
      "We received your enquiry! Our team will reach out to you on WhatsApp shortly.",
    error: null,
  });
});

app.listen(PORT, () =>
  console.log(`🎵 The Raw Studios → http://localhost:${PORT}`),
);
