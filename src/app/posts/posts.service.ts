import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Subject } from "rxjs";
import { map } from "rxjs/operators";
import { Router } from "@angular/router";

import { Post } from "./post.model";
import { environment } from "src/environments/environment";

const backendUrl = environment.apiUrl;

@Injectable({ providedIn: "root" })
export class PostsService {
  private posts: Post[] = [];
  private postsUpdated = new Subject<{ post: Post[]; postCount: number }>();

  constructor(private http: HttpClient, private router: Router) {}

  getPosts(postsPerPage: number, currentPage: number) {

    const queryParams = `?pagesize=${postsPerPage}&page=${currentPage}`;
    this.http
      .get<{ message: string; posts: any; maxPosts: number }>(
        backendUrl+ "posts" + queryParams
      )
      .pipe(
        map(postData => {
          return {
            posts: postData.posts.map(post => {
              return {
                title: post.title,
                content: post.content,
                id: post._id,
                imagePath: post.imagePath,
                creator: post.creator,
                likedby: post.likedby,
              };
            }),
            maxPosts: postData.maxPosts
          };
        })
      )
      .subscribe(transformedPostData => {
        this.posts = transformedPostData.posts;
        this.postsUpdated.next({
          post: [...this.posts],
          postCount: transformedPostData.maxPosts
        });
      });
  }

  getPostUpdateListener() {
    return this.postsUpdated.asObservable();
  }

  getPost(id: string) {
    return this.http.get<{
      _id: string;
      title: string;
      content: string;
      imagePath: string;
      creator: string;
      likedby: string[];
    }>(backendUrl+ "posts/" + id);
  }

  addPost(title: string, content: string, image: File) {
    const postData = new FormData();
    postData.append("title", title);
    postData.append("content", content);
    postData.append("image", image, title);
    this.http
      .post<{ message: string; post: Post }>(
        backendUrl+ "posts",
        postData
      )
      .subscribe(responseData => {
        this.router.navigate(["/"]);
      });
  }

  updatePost(id: string, title: string, content: string, image: File | string, likedby: string[]
    ) {
    let postData: Post | FormData;
    if (typeof image === "object") {
      postData = new FormData();
      postData.append("id", id);
      postData.append("title", title);
      postData.append("content", content);
      postData.append("image", image, title);
      postData.append('likedby', JSON.stringify(likedby));
    } else {
      postData = {
        id: id,
        title: title,
        content: content,
        imagePath: image,
        creator: null,
        likedby: likedby
      };
      console.log('ppp',postData);

    }
    // console.log('back', backendUrl);
    console.log('postData',postData);


    this.http
      .put(backendUrl+ "posts/" + id, postData)
      .subscribe(response => {
        this.router.navigate(["/"]);
      });
  }

  likePost(post: Post, likedbyUserId: string, posts: Post[]) {
    const id = post.id;
    let likedData = {
      _id: post.id,
      title: post.title,
      content: post.content,
      imagePath: post.imagePath,
      creator: post.creator,
      likedbyArr: post.likedby,
      likedby: likedbyUserId,
      posts: posts,
    };

    this.http
      .put<{ message: string; posts: Post[]; maxPosts: number }>(
        backendUrl + 'posts/like/' + id,
        likedData
      )
      .subscribe((result) => {
        this.postsUpdated.next({
          post: result.posts,
          postCount: result.maxPosts,
        });
        console.log(result);

        this.router.navigate(['/']);
      });
  }


  deletePost(postId: string) {
    console.log(postId);
    return this.http.delete(backendUrl+ "posts/" + postId);
  }
}
