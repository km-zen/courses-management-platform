import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {InstructorsService} from "../../services/instructors.service";
import {catchError, Observable, throwError} from "rxjs";
import {PageResponse} from "../../model/page.response.model";
import {Instructor} from "../../model/instructor.model";
import {EmailExistValidator} from "../../validators/emailexist.validator";
import {UsersService} from "../../services/users.service";
import {CoursesService} from "../../services/courses.service";
import {Course} from "../../model/course.model";

@Component({
  selector: 'app-teachers',
  templateUrl: './teachers.component.html',
  styleUrls: ['./teachers.component.css']
})


export class TeachersComponent implements OnInit {
  searchFormGroup!: FormGroup;
  instructorFormGroup!: FormGroup;
  pageInstructors!: Observable<PageResponse<Instructor>>;
  pageCourses$!: Observable<PageResponse<Course>>;

  modalInstructor!: Instructor;
  errorMessage!:string;
  coursesErrorMessage!: string;
  currentPage:number = 0;
  pageSize:number = 5;
  coursesCurrentPage: number = 0;
  coursesPageSize: number = 5;

  submitted:boolean = false;


  constructor(private modalService: NgbModal, private fb: FormBuilder, private instructorService: InstructorsService, private userService: UsersService, private courseService: CoursesService) {}

  ngOnInit(): void {
    this.searchFormGroup = this.fb.group({
      keyword : this.fb.control('')
    })
    this.instructorFormGroup = this.fb.group({
      firstName: ["", Validators.required],
      lastName: ["", Validators.required],
      summary: ["", Validators.required],
      user: this.fb.group({
        email: ["",Validators.required, [EmailExistValidator.validate(this.userService)]],
        password: ["", Validators.required]
      })
    })
    this.handleSearchInstructors()
  }

  // Validators.pattern("^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$")

  getModal(content: any){
    this.modalService.open(content, { size: 'xl' })
    this.submitted = false;
  }


  handleSearchInstructors() {
    let keyword = this.searchFormGroup.value.keyword;
    this.pageInstructors = this.instructorService.searchInstructors(keyword, this.currentPage, this.pageSize).pipe(
      catchError( err => {
        this.errorMessage = err.message;
        return throwError(err);
        })
    )
  }

  goToPage(page: number) {
    this.currentPage=page;
    this.handleSearchInstructors();
  }

  handleDeleteInstructor(i: Instructor) {
    let conf = confirm("Are you sure?");
    if(!conf) return;
    this.instructorService.deleteInstructor(i.instructorId).subscribe({
      next: () => {
        this.handleSearchInstructors();
      }, error: err =>{
        alert(err.message);
        console.log(err);
      }
      }
    )
  }

  onCloseModal(modal: any) {
    modal.close();
    this.instructorFormGroup.reset();
  }

  onSaveInstructor(modal: any) {
    console.log(this.instructorFormGroup);
    this.submitted = true;
    if(this.instructorFormGroup.invalid) return;
    this.instructorService.saveInstructor(this.instructorFormGroup.value).subscribe({
      next: () => {
        alert("success Saving Instructor");
        this.handleSearchInstructors();
        this.instructorFormGroup.reset();
        this.submitted=false;
        modal.close();
      }, error: err => {
        alert(err.message)
        console.log(err);
      }
    })
  }

  getCoursesModal(i: Instructor, coursesContent: any) {
    this.coursesCurrentPage = 0;
    this.modalInstructor = i
    this.handleSearchCourses(i);
    this.modalService.open(coursesContent, {size: 'xl'});
  }

  private handleSearchCourses(i: Instructor) {
    this.pageCourses$ = this.courseService.getCoursesByInstructor(i.instructorId, this.coursesCurrentPage, this.coursesPageSize).pipe(
      catchError( err => {
        this.coursesErrorMessage = err.message;
        return throwError(err);
      })
    )
  }

  gotoCoursePage(page: number) {
    this.coursesCurrentPage = page;
    this.handleSearchCourses(this.modalInstructor);
  }
}

