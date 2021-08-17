import { HttpClient } from "@angular/common/http";
import { Component, ComponentFactory, ComponentFactoryResolver, Input, OnInit, ViewChild, ViewContainerRef } from "@angular/core";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { ChatComponent } from "../chat/chat.component";
import { chatModel } from "../chat/message.model";

@Component({
    selector: 'chat-search',
    templateUrl: './search.component.html',
    styleUrls: ['./search.component.scss'],
    providers: [ChatComponent]
  })
  export class SearchComponent implements OnInit {
    // @Input() comp: ChatComponent[] = [];

    // @ViewChild(AdDirective, {static: true}) adHost!: AdDirective;
    @ViewChild('viewContainer', {read: ViewContainerRef, static: true}) view!: ViewContainerRef;

    // export class ParentComponent implements OnInit {
        // @ViewChild('viewContainer', read: ViewContainerRef) viewContainer: ViewContainerRef;
    //   constructor(private resolver: ComponentFactoryResolver) {}
    //   }
      
    // userName: string = "";

    

    // findUserFormControl = new FormControl('', [
    //     Validators.required,
    //     Validators.email,
    // ]);

    constructor(private componentFactoryResolver: ComponentFactoryResolver,
        private formBuilder: FormBuilder,
        private http: HttpClient) {}


    public chatId: string = "";

    userForm = this.formBuilder.group({
        userName: ""
    })

    ngOnInit(): void {

    }

    // ngAfterViewInit() {
        // this.loadComponent();
    // }

    ngAfterContentInit() {
        // this.loadComponent();
    }

    loadComponent() {
        // const adItem = this.comp[0];
        // const componentFactory = this.componentFactoryResolver.resolveComponentFactory(ChatComponent.component);
        // const viewContainerRef = this.adHost.viewContainerRef;
        console.log("loading component");
        this.view.clear();
        const componentFactory = this.componentFactoryResolver.resolveComponentFactory(ChatComponent);
        this.view.createComponent(componentFactory);
        // const componentRef = viewContainerRef.createComponent<ChatComponent>(this.chat);
    }
    public submitUser() {
        const newChat: chatModel = {
            name: '',
            user: this.userForm.controls['userName'].value
        }
        let findUser: string = 'api/chat/find/' + this.userForm.controls['userName'].value;
        this.http.get<chatModel>(findUser).subscribe(
            (response) => this.chatId = response.user,
            (error) => this.http.post<chatModel>('api/chat/new', newChat).subscribe(
                (response) => this.chatId = response.user,
                (error) => console.log(error)
            )
        )
        // this.loadComponent();
    }

}
