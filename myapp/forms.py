from django import forms
from myapp.models import CustomUser


class UserRegistrationForm(forms.ModelForm):
    password = forms.CharField(widget=forms.PasswordInput)

    class Meta:
        model = CustomUser
        fields = ['email', 'name', 'contact_no',
                  'employee_designation', 'password', 'user_type']

    def save(self, commit=True):
        user = super().save(commit=False)
        user_type = self.cleaned_data.get('user_type')

        if user_type == 'normal':
            user = CustomUser.objects.create_user(**self.cleaned_data)
        elif user_type == 'staff':
            user = CustomUser.objects.create_staffuser(**self.cleaned_data)
        elif user_type == 'superuser':
            user = CustomUser.objects.create_superuser(**self.cleaned_data)

        if commit:
            user.save()
        return user
