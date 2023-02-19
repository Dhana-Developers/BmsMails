import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

export class PasswordValidators {
  constructor() {}

  static patternValidator(regex: RegExp, error: ValidationErrors): ValidatorFn {
    return (control: AbstractControl): any => {
      if (!control.value) {
        // if the control value is empty return no error.
        return null;
      }

      // test the value of the control against the regexp supplied.
      const valid = regex.test(control.value);

      // if true, return no error, otherwise return the error object passed in the second parameter.
      return valid ? null : error;
    };
  }

  static matchValidator(control: AbstractControl): any {
    const passwordControl: any = control.get("userPassword")
    const confirmPasswordControl: any = control.get("confPassword")
    const password: string = passwordControl.value; // get password from our password form control
    const confirmPassword: string = confirmPasswordControl.value; // get password from our confirmPassword form control

    // if the confirmPassword value is null or empty, don't return an error.
    if (!confirmPassword?.length) {
      return null;
    }

    // if the confirmPassword length is < 8, set the minLength error.
    if (confirmPassword.length < 8) {
      confirmPasswordControl.setErrors({ minlength: true });
    } else {
      // compare the passwords and see if they match.
      if (password !== confirmPassword) {
        confirmPasswordControl.setErrors({ mismatch: true });
      } else {
        // if passwords match, don't return an error.
        return null;
      }
    }
  }
}
