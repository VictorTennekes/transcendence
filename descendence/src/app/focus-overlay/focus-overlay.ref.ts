import { OverlayRef } from "@angular/cdk/overlay";

export class FocusOverlayRef {
	constructor (
		private overlayRef: OverlayRef
	) {}

	detachment() {
		return this.overlayRef.detachments();
	}

	backdropClose() {
		return this.overlayRef.backdropClick();
	}

	close() {
		this.overlayRef.dispose();
	}
}
