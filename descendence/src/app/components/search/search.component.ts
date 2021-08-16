import { Component, ComponentFactory, ComponentFactoryResolver, Input, OnInit, ViewChild, ViewContainerRef } from "@angular/core";
import { FormControl, Validators } from "@angular/forms";
import { AdDirective } from "../ad.directive";
import { ChatComponent } from "../chat/chat.component";

@Component({
    selector: 'app-chat',
    templateUrl: './search.component.html',
    styleUrls: ['./search.component.scss'],
    providers: [ChatComponent]
  })
  export class SearchComponent implements OnInit {
    // @Input() comp: ChatComponent[] = [];

    // @ViewChild(AdDirective, {static: true}) adHost!: AdDirective;
    @ViewChild('viewContainer', {read: ViewContainerRef}) view: ViewContainerRef;

    // export class ParentComponent implements OnInit {
        // @ViewChild('viewContainer', read: ViewContainerRef) viewContainer: ViewContainerRef;
    //   constructor(private resolver: ComponentFactoryResolver) {}
    //   }
      


    findUserFormControl = new FormControl('', [
        Validators.required,
        Validators.email,
    ]);

    constructor(private componentFactoryResolver: ComponentFactoryResolver) {}

    ngOnInit(): void {
        this.loadComponent();
    }

    loadComponent() {
        // const adItem = this.comp[0];
        // const componentFactory = this.componentFactoryResolver.resolveComponentFactory(ChatComponent.component);
        // const viewContainerRef = this.adHost.viewContainerRef;
        // this.view.clear();
        const componentFactory = this.componentFactoryResolver.resolveComponentFactory(ChatComponent);
        this.view.createComponent(componentFactory);
        // const componentRef = viewContainerRef.createComponent<ChatComponent>(this.chat);
    }

}
