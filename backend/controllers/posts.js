const Post = require("../models/post");
const mongoose = require("mongoose");

exports.createPost = (req, res, next) => {
  const url = req.protocol + "://" + req.get("host");
  const post = new Post({
    title: req.body.title,
    content: req.body.content,
    imagePath: url + "/images/" + req.file.filename,
    creator: req.userData.userId,
    likedby: []
  });
  // console.log("ADD POST   -------------------------------------------- ",post)
  post.save().then(createdPost => {
    res.status(201).json({
      message: "Post added successfully",
      post: {
        ...createdPost,
        id: createdPost._id
      }
    });
  })
  .catch(error => {
    res.status(500).json({
      message: 'post creating failed.'
    });
  })
}

exports.updatePost =(req, res, next) => {
  let imagePath = req.body.imagePath;

  if (req.file) {
    const url = req.protocol + "://" + req.get("host");
    imagePath = url + "/images/" + req.file.filename;
  }
  const post = new Post({
    _id: req.body.id,
    title: req.body.title,
    content: req.body.content,
    imagePath: imagePath,
    creator: req.userData.userId,
    likedby: req.body.likedby
  });
  console.log('reque:',req.body);
  console.log('post:', post);

  Post.updateOne(
    { _id: req.params.id, creator: req.userData.userId },
    post
  ).then(result => {
    console.log(result,"result")
    if (result.modifiedCount > 0) {
      res.status(200).json({ message: "Update successful!" });
      console.log("postsss", post)
    } else {
      res.status(401).json({ message: "This feature is not for use right now we are working on it." });
      console.log("postsss", post)

    }
  });
}

exports.likePost = (req, res, next) => {
  let finalLikedArray = [...req.body.likedbyArr];
  // console.log(req.body.likedbyArr)

  const indexOf = finalLikedArray.indexOf(req.body.likedby);


  if (indexOf >= 0) finalLikedArray.splice(indexOf, 1);
  else finalLikedArray.push(req.body.likedby);

  const post = new Post({
    _id: req.body._id,
    title: req.body.title,
    content: req.body.content,
    imagePath: req.body.imagePath,
    creator: req.body.creator,
    likedby: finalLikedArray
  });
  // console.log("postasdfghjk", post);
  let updatedPostCount;
  Post.updateOne({ _id: req.body._id }, post)
    .then((result) => {
      console.log("result ",result);
      updatedPostCount = result.modifiedCount;
    })

    .then((res) => {
      return Post.count();
    })
    .then((result) => {
      if (updatedPostCount === 1) {
        const uPost = {
          id: req.body._id,
          title: req.body.title,
          content: req.body.content,
          imagePath: req.body.imagePath,
          creator: req.body.creator,
          likedby: finalLikedArray
        };

        let updatedPost = req.body.posts.map((p) => {
          if (p.id === uPost.id) {
            return uPost;
          } else return p;
        });
        console.log(" Posts ",req.body.posts)
        console.log("updated Post ",updatedPost)
        res.status(200).json({
          message: "Update successful,liked",
          posts: updatedPost,
          maxPosts: result,
        });
      } else {
        let updatedPost = [...req.body.posts];
        res.status(401).json({
          message: "like failed,user not authorized",
          post: updatedPost,
          maxPosts: result,
        });
      }
    });
};

exports.getPosts = (req, res, next) => {
  const pageSize = +req.query.pagesize;
  const currentPage = +req.query.page;
  const postQuery = Post.find();
  let fetchedPosts;
  if (pageSize && currentPage) {
    postQuery.skip(pageSize * (currentPage - 1)).limit(pageSize);
  }
  postQuery
    .then(documents => {
      fetchedPosts = documents;
      return Post.count();
    })
    .then(count => {
      res.status(200).json({
        message: "Posts fetched successfully!",
        posts: fetchedPosts,
        maxPosts: count
      });
    });
}

exports.getPost =  (req, res, next) => {
  Post.findById(req.params.id).then(post => {
    if (post) {
      res.status(200).json(post);
    } else {
      res.status(404).json({ message: "Post not found!" });
    }
  });
}

exports.deletePost =  (req, res, next) => {
  console.log("delete")
  console.log(req.userData)
  Post.deleteOne({ _id: req.params.id, creator: req.userData.userId }).then(
    result => {
      console.log(result);
      if (result.deletedCount > 0) {
        res.status(200).json({ message: "Deletion successful!" });
      } else {
        res.status(401).json({ message: "Not authorized!" });
      }
    }
  );
}
