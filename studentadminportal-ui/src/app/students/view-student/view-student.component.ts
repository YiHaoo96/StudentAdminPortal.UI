import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { Gender } from 'src/app/models/ui-models/gender.model';
import { Student } from 'src/app/models/ui-models/student.model';
import { GenderService } from 'src/app/services/gender.service';
import { StudentService } from '../student.service';

@Component({
  selector: 'app-view-student',
  templateUrl: './view-student.component.html',
  styleUrls: ['./view-student.component.scss'],
})
export class ViewStudentComponent implements OnInit {
  studentId: string | null | undefined;
  student: Student = {
    id: '',
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    email: '',
    mobile: 0,
    genderId: '',
    profileImageUrl: '',
    gender: {
      id: '',
      description: '',
    },
    address: {
      id: '',
      physicalAddress: '',
      postalAddress: '',
    },
  };
  genderList: Gender[] = [];
  isNewStudent = false;
  header = '';
  displayProfileImageUrl = '';

  @ViewChild('studentDetailsForm') studentDetailsForm?: NgForm;

  constructor(
    private readonly studentService: StudentService,
    private readonly route: ActivatedRoute,
    private readonly genderService: GenderService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.studentId = params.get('id');

      if (!!this.studentId) {
        this.isNewStudent =
          this.studentId.toLowerCase() === 'Add'.toLowerCase() ? true : false;
        this.header = this.isNewStudent ? 'Add New Student' : 'Edit Student';
        this.setImage();

        if (!this.isNewStudent)
          this.studentService
            .getStudent(this.studentId)
            .subscribe((successResponse) => {
              this.student = successResponse;
              this.setImage();
            });
      }

      this.genderService.getGenderList().subscribe((successResponse) => {
        this.genderList = successResponse;
      });
    });
  }

  onSave() {
    if (!this.studentDetailsForm?.form.valid) return;

    if (this.isNewStudent) {
      this.studentService.addStudent(this.student).subscribe(
        (successResponse) => {
          this.snackBar.open('Student added successfully.', undefined, {
            duration: 2000,
          });

          setTimeout(() => {
            this.router.navigateByUrl(`students/${successResponse.id}`);
          }, 2000);
        },
        (errorResponse) => {
          console.log(errorResponse);
        }
      );
    } else {
      this.studentService
        .updateStudent(this.student.id, this.student)
        .subscribe(
          (successResponse) => {
            this.snackBar.open('Student updated successfully.', undefined, {
              duration: 2000,
            });
          },
          (errorResponse) => {
            console.log(errorResponse);
          }
        );
    }
  }

  onDelete() {
    this.studentService.deleteStudent(this.student.id).subscribe(
      (successResponse) => {
        this.snackBar.open('Student deleted successfully.', undefined, {
          duration: 2000,
        });

        setTimeout(() => {
          this.router.navigateByUrl('students');
        }, 2000);
      },
      (errorResponse) => {
        console.log(errorResponse);
      }
    );
  }

  onUploadImage(event: any) {
    if (!!this.studentId) {
      const file: File = event.target.files[0];
      this.studentService.uploadImage(this.student.id, file).subscribe(
        (successResponse) => {
          this.student.profileImageUrl = successResponse;
          this.setImage();

          this.snackBar.open(
            'Profile image uploaded successfully.',
            undefined,
            {
              duration: 2000,
            }
          );
        },
        (errorResponse) => {
          console.log(errorResponse);
        }
      );
    }
  }

  private setImage() {
    if (!this.student.profileImageUrl) {
      this.displayProfileImageUrl = '/assets/user.png';
      return;
    }

    this.displayProfileImageUrl = this.studentService.getImagePath(
      this.student.profileImageUrl
    );

    console.log(this.displayProfileImageUrl);
  }
}
