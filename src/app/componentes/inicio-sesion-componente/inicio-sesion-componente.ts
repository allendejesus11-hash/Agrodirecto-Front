import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

type TipoUsuario = 'productor' | 'transportista' | 'admin';

@Component({
  imports: [MatButtonModule, MatInputModule, MatFormFieldModule, ReactiveFormsModule, RouterLink],
  selector: 'app-inicio-sesion-componente',
  styleUrl: './inicio-sesion-componente.css',
  templateUrl: './inicio-sesion-componente.html',
})
export class InicioSesionComponente {

  private fb: FormBuilder = inject(FormBuilder);
  private router: Router = inject(Router);

  tipoUsuario = signal<TipoUsuario>('productor');
  errorContrasena = signal(false);

  loginForm = this.fb.group({
    usuario: [''],
    contrasena: [''],
  });

  ingresar(): void {
    const contrasena = this.loginForm.controls.contrasena.value ?? '';

    if (contrasena.length < 6) {
      this.errorContrasena.set(true);
      setTimeout(() => this.errorContrasena.set(false), 2000);
      return;
    }

    this.errorContrasena.set(false);

    if (this.tipoUsuario() === 'productor') {
      this.router.navigateByUrl('/inicio-productor');
    } else if (this.tipoUsuario() === 'transportista') {
      this.router.navigateByUrl('/inicio-transportista');
    } else {
      this.router.navigateByUrl('/inicio-admin');
    }
  }
}
