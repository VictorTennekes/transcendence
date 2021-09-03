import { OverlayRef } from "@angular/cdk/overlay";

export class FocusOverlayRef {
	constructor (
		private overlayRef: OverlayRef
	) {}

	detachment() {
		return this.overlayRef.detachments();
	}

	close() {
		this.overlayRef.dispose();
	}
}
