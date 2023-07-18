const router = require('express').Router();
const User = require('../models/User');
const Drink = require('../models/Drink');
const Favorite = require('../models/Favorite');

function isAuthenticated(req, res, next) {
  const isAuthenticated = req.session.user_id;
  if (!isAuthenticated) return res.redirect('/login');
  next();
}
// Show Homepage
router.get('/', async (req, res) => {
  // let cocktails = await Cocktail.findAll({
  //   include: User
  // });

  res.render('index', {
    isHome: true,
    isLoggedIn: req.session.user_id,
    ageVerified: req.session.ageVerified
    // cocktails: cocktails
  });
});

// Verify Age
router.get('/verify', (req, res) => {
  req.session.ageVerified = true; 
  res.redirect('/'); 
});

// Show sorry page
router.get('/sorry', async (req, res) => {
  res.render('sorry', {
    layout: "error.hbs",
   
  });
});

// Show Login Page
router.get('/login', (req, res) => {
  if (req.session.user_id) return res.redirect('/dashboard')
  return res.render('login', {
    isLogin: true,
    ageVerified: req.session.ageVerified
  });
});

// Show Register Page
router.get('/register', (req, res) => {
  if (req.session.user_id) return res.redirect('/dashboard')
  res.render('register', {
    isRegister: true,
    ageVerified: req.session.ageVerified
  });
});

// Show Dashboard Page
router.get('/dashboard', isAuthenticated, async (req, res) => {
  try {
    const user = await User.findByPk(req.session.user_id);
    // Fetch the user's favorite cocktails
    const favorites = await Favorite.findAll({
      where: { userId: user.id },
    });
    const serFav = favorites.map(favorite => favorite.get({plain:true}))

    res.render('dashboard', {
      userName: user.userName,
      ageVerified: req.session.ageVerified,
      isLoggedIn: req.session.user_id,
      favorites: serFav,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

router.post('/dashboard', (req, res) => {
  const userId = req.session.user_id;

  const { cocktailName, cocktailImage } = req.body;

  Favorite.create({
    cocktailName: cocktailName,
    userId: userId,
    cocktailImage: cocktailImage
  })
    .then(favorite => {
      res.redirect('/dashboard');
    })
    .catch(error => {
      console.error('Error:', error);
      res.status(500).send('Error occurred while saving the favorite cocktail');
    });
});

module.exports = router;

