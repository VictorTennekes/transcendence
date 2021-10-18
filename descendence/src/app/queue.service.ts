import { ElementRef, Injectable } from "@angular/core";
import { Overlay, OverlayConfig } from '@angular/cdk/overlay';
import { QueueComponent } from "./queue/queue.component";
import { ComponentPortal } from '@angular/cdk/portal';
import { FocusOverlayRef } from "./focus-overlay/focus-overlay.ref";
import { MatchService } from './match.service';
import { MatDialog } from "@angular/material/dialog";
import { AcceptComponent } from "./accept/accept.component";
import { Router } from "@angular/router";

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
		private readonly dialog: MatDialog,
		private readonly router: Router,
	) {
		this.matchService.readyListener.subscribe(() => {
			console.log("RECEIVED READY SIGNAL");
			let acceptDialog = this.dialog.open(AcceptComponent, {panelClass: 'two-factor-panel', disableClose: true, height: 'auto'});
			acceptDialog.afterClosed().subscribe((res: {result: boolean, self: boolean, id: string}) => {
				if (res.result) {
					this.close();
					this.router.navigate(['game/' + res.id]);
				}
				else {
					if (!res.self) {
						this.close();
					}
				}
			})
		});
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
