import { Injectable } from "@angular/core";
import { Overlay, OverlayConfig } from '@angular/cdk/overlay';
import { FocusOverlayComponent } from "./focus-overlay.component";
import { ComponentPortal, PortalInjector } from '@angular/cdk/portal';
import { FocusOverlayRef } from "./focus-overlay.ref";
import { SharedValidatorService } from "./shared-validator.service";

interface FilePreviewDialogConfig {
	panelClass?: string;
	hasBackdrop?: boolean;
	backdropClass?: string;
}

const DEFAULT_CONFIG: FilePreviewDialogConfig = {
	hasBackdrop: true,
	backdropClass: 'dark-backdrop',
	panelClass: 'tm-file-preview-dialog-panel'
}

//TODO: replace 'SharedValidatorService' by switching from Overlay to Dialog and passing/returnin data from the dialog

@Injectable()
export class FocusOverlayService {
	dialogRef: FocusOverlayRef;
	constructor(
		private readonly overlay: Overlay,
		private valid: SharedValidatorService
	) { }

	private getOverlayConfig(config: FilePreviewDialogConfig): OverlayConfig {
		const positionStrategy = this.overlay.position()
		.global()
		.centerHorizontally()
		.centerVertically();
		
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
		this.dialogRef.close();
	}

	detachments() {
		return this.dialogRef.detachment();
	}

	open(config: FilePreviewDialogConfig = {}) {
		const dialogConfig = {
			...DEFAULT_CONFIG,
			...config,
		}
		const overlayRef = this.createOverlay(dialogConfig);
		const focusOverlayPortal = new ComponentPortal(FocusOverlayComponent);
		this.dialogRef = new FocusOverlayRef(overlayRef);
		overlayRef.attach(focusOverlayPortal);
		overlayRef.backdropClick().subscribe((_) => {
			this.valid.valid = false;
			this.dialogRef.close();
		});
		
		return this.dialogRef;
	}
}
