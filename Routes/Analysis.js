const express = require("express");
const _ = require("lodash");
const router = express.Router();
const fetch = require("node-fetch");
require("dotenv").config();

const options = {
  method: "GET",
  headers: {
    "x-hasura-admin-secret":
      process.env.SECRET,
  },
};

//function to fetch blogs from given url
const fun = async () => {
  try {
    const response = await fetch(
      "https://intent-kit-16.hasura.app/api/rest/blogs",
      options
    );
    const data = await response.json();
    return data;
  } catch (e) {
    console.log(e);
    return e
  }
};


//the analytics funtions which get data of all blogs and returns specified analytics as an object
const getCachedData = async()=>{
  const fetchedData = await fun();

  const len = fetchedData.blogs.length;
  const blogWithLongestTitle = _.maxBy(fetchedData.blogs, "title.length");
  const blogsWithPrivacy = _.filter(fetchedData.blogs, (blog) =>
    _.includes(blog.title.toLowerCase(), "privacy")
  );
  const privacyBlogs = blogsWithPrivacy.length;
  const uniqueBlogTitles = _.uniqBy(fetchedData.blogs, "title");
  const uniquelength = uniqueBlogTitles.length;

  const temp = {
    TotalBlogs: len,
    LongestTitle: blogWithLongestTitle,
    BlogsWithWordPrivacy: privacyBlogs,
    NumberOfUniqueBlogs: uniquelength,
    UniqueBlogTitless: uniqueBlogTitles,
  };
  return temp;
}


//router to get analytics
router.get("/blog-stats", async (req, res) => {
 try {
  const cachedDataAgain = await getCachedData();
  res.send(cachedDataAgain) 
 } catch (error) {
  res.status(400).json({error : "error while fetching blogs"})
 }
});


//searching blogs with query parameter
const querySearch =async(query)=>{
  const fetchedData = await fun();
    
  const blogsWithQuery = _.filter(fetchedData.blogs, (blog) =>
    _.includes(blog.title, query)
  );
  if (blogsWithQuery.length === 0) {
    return ({ error: "No matching blogs found" });
  }
  return blogsWithQuery
}


//memoizing the fetched results for 30 seconds...
const memoizedAnalytics = _.memoize(querySearch, (query) => query, 30000);


//roter to get all blogs which contains the word which will be passes as query
router.get("/blog-search", async (req, res) => {
  try {
    const ans = await memoizedAnalytics(req.query.query)
    res.send(ans);
  } catch (error) {
    res.status(400).json({error : "error while fetching blogs"})
  }
});


module.exports = router;
