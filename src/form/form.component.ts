import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';

interface Option {
  value: number;
  label: string;
}

interface DefaultData {
  option: number;
  values: (string | number)[];
}

@Component({
  selector: 'app-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule],
  templateUrl: './form.component.html',
  styles: [`
    form {
      display: flex;
      flex-direction: column;
      max-width: 300px;
      margin: 0 auto;
    }
    mat-form-field {
      margin-bottom: 20px;
    }
    textarea {
      min-height: 100px;
    }
  `]
})
export class FormComponent implements OnInit {
  @Input() options: Option[] = [
    { value: -1, label: 'Please select an option' },
    { value: 1, label: 'IP v4 address (max 2)' },
    { value: 2, label: 'IP v4 or v6 address (max 63)' },
    { value: 3, label: 'FQDN (max 1)' },
    { value: 4, label: 'Number (68-65535, max 1)' },
    { value: 5, label: 'Filename with path (max 1)' }
  ];

  @Input() defaultData: DefaultData = {
    option: -1,
    values: []
  };

  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      option: [-1, [Validators.required, Validators.min(1)]],
      values: ['', [Validators.required, this.valuesValidator.bind(this)]]
    });
  }

  ngOnInit() {
    this.form.get('option')?.valueChanges.subscribe(() => {
      this.form.get('values')?.updateValueAndValidity();
    });

    this.form.get('values')?.valueChanges.subscribe((value: string) => {
      if (this.form.get('option')?.value !== 5) {
        const arrayValues = value.split(',').map(v => v.trim());
        this.form.get('values')?.setValue(arrayValues.join(','), { emitEvent: false });
      }
    });
  }

  getPlaceholder(): string {
    switch (this.form.get('option')?.value) {
      case 1: return 'Enter up to 2 IPv4 addresses, comma-separated';
      case 2: return 'Enter up to 63 IPv4 or IPv6 addresses, comma-separated';
      case 3: return 'Enter an FQDN';
      case 4: return 'Enter a number between 68 and 65535';
      case 5: return 'Enter a filename with path';
      default: return 'Please select an option first';
    }
  }

  getInputType(): string {
    const option = this.form.get('option')?.value;
    if (option === 4) return 'number';
    if (option === 5) return 'textarea';
    return 'text';
  }

  valuesValidator(control: any) {
    const option = this.form?.get('option')?.value;
    if (option === -1) return { optionNotSelected: true };
    
    const values = control.value.toString().split(',').map((v: string) => v.trim());

    switch (option) {
      case 1:
        if (values.length > 2) return { maxExceeded: true };
        const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
        if (!values.every((v: string) => ipv4Regex.test(v))) return { invalidFormat: true };
        break;
      case 2:
        if (values.length > 63) return { maxExceeded: true };
        const ipv4v6Regex = /^((\d{1,3}\.){3}\d{1,3}|([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4})$/;
        if (!values.every((v: string) => ipv4v6Regex.test(v))) return { invalidFormat: true };
        break;
      case 3:
        if (values.length > 1) return { maxExceeded: true };
        const fqdnRegex = /^(?=.{1,253}$)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.?$/;
        if (!fqdnRegex.test(values[0])) return { invalidFormat: true };
        break;
      case 4:
        if (values.length > 1) return { maxExceeded: true };
        const num = Number(values[0]);
        if (isNaN(num) || num < 68 || num > 65535) return { invalidFormat: true };
        break;
      case 5:
        if (values.length > 1) return { maxExceeded: true };
        // Simple check for a valid filename with path
        if (!/^[a-zA-Z0-9_\-./]+$/.test(values[0])) return { invalidFormat: true };
        break;
    }

    return null;
  }

  getErrorMessage(): string {
    const valuesControl = this.form.get('values');
    if (valuesControl?.hasError('required')) return 'This field is required';
    if (valuesControl?.hasError('optionNotSelected')) return 'Please select an option first';
    if (valuesControl?.hasError('maxExceeded')) return 'Maximum number of items exceeded';
    if (valuesControl?.hasError('invalidFormat')) return 'Invalid format';
    return '';
  }

  onSubmit() {
    if (this.form.valid) {
      const formValue = this.form.value;
      const transformedValues = formValue.option === 5
        ? [formValue.values]
        : formValue.values.split(',').map((v: string) => v.trim());

      const result = {
        option: formValue.option,
        values: transformedValues
      };

      console.log(result);
      // Here you can handle the form submission with the transformed data
    }
  }
}