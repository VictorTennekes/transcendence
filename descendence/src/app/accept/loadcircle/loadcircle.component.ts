import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';

@Component({
	selector: 'app-loadcircle',
	templateUrl: './loadcircle.component.html',
	styleUrls: ['./loadcircle.component.scss']
})
export class LoadcircleComponent implements OnInit {
	
	constructor() {
	}

	value: string = "3";
	
	circle: any;
	
	run(angle: number) {
		const radius = 31.5;
		const circumference = 2 * Math.PI * radius;
		
		const strokeOffset = (1 / 4) * circumference;
		const strokeDasharray = (angle / 360) * circumference;
		
		this.circle.setAttribute('r', radius);
		this.circle.setAttribute('stroke-dasharray', [
			strokeDasharray,
			circumference - strokeDasharray
		]);
		this.circle.setAttribute('stroke-dashoffset', strokeOffset);
	}
	
	
	ngOnInit(): void {
		this.circle = document.querySelector('circle');
		var timer = 3 * 1000;
		let interval = 100;
		const startTime = new Date();
		var inter = setInterval(() => {
			let nowTime = new Date();
			const difference = nowTime.getTime() - startTime.getTime();
			let degrees = (timer - difference) / timer;
			if (degrees < 0)
				degrees = 0;
			const angle = degrees * 360;
			this.run(angle);
			if (difference > timer)
				clearInterval(inter);
		}, interval)
	}
}
