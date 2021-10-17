import { ElementRef, Injectable } from "@angular/core";
import { Overlay, OverlayConfig } from '@angular/cdk/overlay';
import { QueueComponent } from "./queue/queue.component";
import { ComponentPortal } from '@angular/cdk/portal';
import { FocusOverlayRef } from "./focus-overlay/focus-overlay.ref";
import { MatchService } from './match.service';
import { AcceptService } from "./accept.service";

interface FilePreviewDialogConfig {
	panelClass?: string;
	hasBackdrop?: boolean;
	backdropClass?: string;
}

const DEFAULT_CONFIG: FilePreviewDialogConfig = {
	hasBackdrop: true,
	backdropClass: 'dark-backdrop',
	panelClass: ''
}

@Injectable()
export class QueueService {
	timePassed: number = 0;
	findDisabled = false;
	dialogRef: FocusOverlayRef;
	interval: NodeJS.Timeout;

	constructor(
		private readonly overlay: Overlay,
		private readonly matchService: MatchService,
		private readonly acceptService: AcceptService
	) {
	}

	private getOverlayConfig(config: FilePreviewDialogConfig): OverlayConfig {
		const view = document.getElementById("view");

		const positionStrategy = this.overlay.position()
		.flexibleConnectedTo(new ElementRef(view))
		.withPositions([{
			offsetX: -245,
			originX: 'center',
			originY: 'top',
			overlayX: 'end',
			overlayY: 'top',
		  }]);
		
		const overlayConfig = new OverlayConfig({
			...config,
			scrollStrategy: this.overlay.scrollStrategies.block(),
			positionStrategy
		});
		
		return overlayConfig;
	}

	private createOverlay(config: FilePreviewDialogConfig) {
		// Returns an OverlayConfig
		const overlayConfig = this.getOverlayConfig(config);
		
		// Returns an OverlayRef
		return this.overlay.create(overlayConfig);
	}

	close() {
		// this.matchService.cancelMatch();
		this.findDisabled = false;
		this.dialogRef.close();
		clearInterval(this.interval);
	}

	detachments() {
		return this.dialogRef.detachment();
	}

	open(config: FilePreviewDialogConfig = {}) {
		const dialogConfig = {
			...DEFAULT_CONFIG,
			...config,
		}
		this.matchService.readyListener.subscribe(() => {
			console.log("RECEIVED READY SIGNAL");
			this.close();
			this.acceptService.open();
		});
		this.interval = setInterval(() => {this.timePassed++}, 1000);
		this.findDisabled = true;
		const overlayRef = this.createOverlay(dialogConfig);
		const focusOverlayPortal = new ComponentPortal(QueueComponent);
		this.dialogRef = new FocusOverlayRef(overlayRef);
		overlayRef.attach(focusOverlayPortal);

		//listen for 'ready'
		// this.matchService.sendListen(); //let the server know we're listening
		
		return this.dialogRef;
	}
}
