/*
Feed Container Component | Client | SUITAPP Web App
GROUP 1: Amine Bensalem, Douglas MacKrell, Savita Madray, Joseph P. Pasaoa
*/


import React, { PureComponent } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

// import './Feed.css';

import PostCard from './PostCard';


export default class Feed extends PureComponent {
  pw = sessionStorage.getItem('Suit_App_KS');
  // uId = sessionStorage.getItem('Suit_App_UId');
  state = {
    posts: []
  }

  async componentDidMount() {
    // console.log("componentDidMount ran");
    await this.getFeed();
  }

  async componentDidUpdate(prevProps, prevState) {
    // console.log("componentDidUpdate ran");
    const arePathnamesSame = this.props.location.pathname === prevProps.location.pathname;
    const areSearchesSame = this.props.location.search === prevProps.location.search;
    if (!arePathnamesSame || !areSearchesSame) {
      // console.log("RERUNNING GETFEED");
      await this.getFeed();
    }
  }

  getSearches = () => {
      let process = new URLSearchParams(this.props.location.search);
      const string = process.get("search");
      // console.log("searchCheck: ", string);
      return string;
  }

  getFeed = async () => {
    let url = 'http://localhost:3129/posts/';             // location parse begins at global feed
    const pathname = this.props.location.pathname;
    const searchString = this.getSearches();
    if (!pathname.includes("all")) {                      // switch to follows feed
      url += `follows/${this.props.userId}`;
    } else if (searchString) {                            // switch to hashtags feed
      url += `tags/?hashtags=${searchString}`;
    }
    const response = await axios.get(url);
    this.setState((prevState, props) => {
        return {posts: response.data.payload}
    });
  }

  // handleClickHashtag = async (event) => {
  //   event.preventDefault();
  //   console.log(this.props.history)
  //   this.props.history.push({
  //       pathname: `/${this.props.username}/feed/all`,
  //       search: `?search=${this.state.search}`
  //   });
  // }

  // ############## RENDER ################
  render() {
    // console.log("render ran, posts: ", this.state.posts);
    const postsList = this.state.posts.map(post => {
        let tagData = post.hashtag_str;
        let hashtags = tagData.split('#');
        hashtags = hashtags.filter(el => !!el).map(tag => {
            return (
              <Link 
                key={post.id + tag} 
                to={`/${this.props.username}/feed/all?search=${tag}`} 
                className="j-post-hashtag-link" 
              >
                {'#' + tag}
              </Link>
            );
        });

        // const hashtagsStr = hashtags.join(' ');

        const timestamp = new Date(post.time_created);
        return(
            <PostCard
              key={post.id} 
              username={post.username} 
              avatar_url={post.avatar_url} 
              title={post.title}
              caption={post.caption} 
              hashtags={hashtags} 
              id={post.id} 
              image_url={post.image_url} 
              time_created={timestamp.toLocaleString()}

              handleClickHashtag={this.handleClickHashtag}
            />
        );
    });

    return (
      <>
        {postsList}
      </>
    )
  }
}
