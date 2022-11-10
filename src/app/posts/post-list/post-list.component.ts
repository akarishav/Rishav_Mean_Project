import { Component, OnDestroy, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { Post } from '../post.model';
import { PostsService } from '../posts.service';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css']
})
export class PostListComponent implements OnInit, OnDestroy {

//   posts =[
// { title: "First post" , content : "This is First"},
// { title: "second post" , content : "This is second"},
// { title: "third post" , content : "This is third"}
//   ];


posts: Post[] = [];
  isLoading = false;
  totalPosts = 10;
  postsPerPage = 5;
  currentPage = 1;
  pageSizeOptions = [1, 2, 5, 10];
  likeCount = 0;
  likedby = [];
  userIsAuthenticated = false;
  userId: string;
  private postsSub: Subscription;
  private authStatusSub: Subscription;
  public like : boolean=false;


  constructor(public postsService: PostsService, private authService: AuthService) {}

  ngOnInit() {
    this.isLoading = true;
    this.userId = this.authService.getUserId();
    this.postsService.getPosts(this.postsPerPage, this.currentPage);
    this.postsSub = this.postsService
      .getPostUpdateListener()
      .subscribe((postData: {post: Post[], postCount: number}) => {
        this.isLoading = false;
        this.totalPosts = postData.postCount;
        this.posts = postData.post;
        this.userId = this.authService.getUserId();

        // console.log(this.userId);
      });
      this.userIsAuthenticated = this.authService.getIsAuth();
      this.authStatusSub = this.authService.getAuthStatusListener().subscribe(isAuthenticated => {
        this.userIsAuthenticated = isAuthenticated;
        console.log(this.userIsAuthenticated);
        this.userId = this.authService.getUserId();
        console.log(this.userId);
      });
  }

  onChangedPage(pageData: PageEvent) {
    this.isLoading = true;
    this.currentPage = pageData.pageIndex + 1;
    this.postsPerPage = pageData.pageSize;
    this.postsService.getPosts(this.postsPerPage, this.currentPage);
    // console.log('poststst',this.postsService.getPosts);

  }

  onDelete(postId: string) {
    console.log(postId);
    this.isLoading = true;
    this.postsService.deletePost(postId).subscribe(() => {
    this.postsService.getPosts(this.postsPerPage, this.currentPage);
    });
  }
  ngOnDestroy() {
    this.postsSub.unsubscribe();
    this.authStatusSub.unsubscribe();
  }

//   onLike(){
//     this.like = !this.like;
//     const userId = localStorage.getItem('userId');

//     // console.log('user',userId);
//     // console.log('like',this.like);
//     if (this.like){
//       console.log("Liked");
//       this.likeCount++;
//       this.likedby.push(userId);
//       // console.log(this.likeCount);

//     }else{
//       console.log('unliked');
//       if (this.likedby.includes(userId)){
//         this.likedby.splice(0);
//       }
//       // this.likeCount--;
//     }
//     console.log(this.likedby);
//   }


onLike(post: Post) {
  console.log('Liked post', post);
  console.log('Posts', this.posts);

  this.like = !this.like;
  const userId = localStorage.getItem('userId');
  this.postsService.likePost(post, userId, this.posts);
  // console.log(post, userId);
}
}
