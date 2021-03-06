const blogRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

const getTokenFrom = request => {
  const authorization = request.get('authorization')
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    return authorization.substring(7)
  }
  return null
}

blogRouter.get('/', async (req, res) => {

  const blogs = await Blog.find({}).populate('user', {
    username: 1,
    name: 1,
    id: 1 
  })

  res.json(blogs)

  // // Promise chaining method 
  // Blog
  //   .find({})
  //   .then(blogs => {
  //     res.json(blogs)
  //   })

})

blogRouter.post('/', async (req, res) => {

  const body = req.body 
  
  if (!body.title || !body.author){
    
    res.status(400).json({
      error: "missing title or url"
    })
    
  } else {
    
    const token = getTokenFrom(req)
    const decodedToken = jwt.verify(token, process.env.SECRET)
  
    if (!token || !decodedToken.id) {
      return res.status(401).json({ error: 'token missing or invalid' })
    }

    const user = await User.findById(decodedToken.id)

    const blog = new Blog({
      title: body.title,
      author: body.author,
      url: body.url,
      likes: body.likes,
      user: user._id
    })

    const savedBlog = await blog.save()
    user.blogs = user.blogs.concat(savedBlog._id)
    await user.save()
    res.json(savedBlog.toJSON())
    
    // // Promise chaining method 
    // blog
    //   .save()
    //   .then(savedBlog => {
    //     res.json(savedBlog.toJSON())
    //   })

  }
})

blogRouter.put('/:id', async (req, res) => {

  const id = req.params.id
  const blog = req.body

  await Blog.findByIdAndUpdate(id, blog)
  res.status(204).end()

})


blogRouter.delete('/:id', async (req, res) => {

  const id = req.params.id
  const token = req.token

  const decodedToken = jwt.verify(token, process.env.SECRET)
  if (!req || !decodedToken) {
    return res.status(401).json( { error: 'token missing or invalid ' })
  }

  const blog = await Blog.findById(req.params.id)
  if ( blog.user.toString() !== decodedToken.id.toString()) {
    return res.status(401).json( { error: 'permission denied ' })
  }

  await Blog.findByIdAndRemove(id)
  res.status(204).end()

})


module.exports = blogRouter
