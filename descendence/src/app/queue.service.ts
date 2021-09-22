import { Injectable } from "@angular/core";
import { Overlay, OverlayConfig } from '@angular/cdk/overlay';
import { QueueComponent } from "./queue/queue.component";
import { ComponentPortal } from '@angular/cdk/portal';
import { FocusOverlayRef } from "./focus-overlay/focus-overlay.ref";

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
	dialogRef: FocusOverlayRef;
	constructor(
		private readonly overlay: Overlay,
	) { }
	// createInjector(data: any): PortalInjector {
	// 	const injectorTokens = new WeakMap();
	// 	injectorTokens.set(INIT_DATA, data);
	// 	return new PortalInjector(this.injector, injectorTokens);
	// }

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
		const focusOverlayPortal = new ComponentPortal(QueueComponent);
		this.dialogRef = new FocusOverlayRef(overlayRef);
		overlayRef.attach(focusOverlayPortal);
		// overlayRef.backdropClick().subscribe((_) => {
		// 	this.dialogRef.close();
		// });
		
		return this.dialogRef;
	}
}
