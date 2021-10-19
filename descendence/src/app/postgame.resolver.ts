import { Injectable } from '@angular/core';
import {
  Router, Resolve,
  RouterStateSnapshot,
  ActivatedRouteSnapshot,
  ActivatedRoute
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { GameService } from './game.service';
import { UserEntity, UserService } from './user.service';

export interface Player {
  intra_name: string,
	display_name: string,
	score: number
};

export interface PostGameData {
	id: string,
	duration: number,
	start: Date,
	end: Date,
	data: {
		scores: {[key: string] : number},
		winner: string
	}
};

export interface ResolvedPostGame {
  duration: number,
  players: Player[],
  winner: string
}

@Injectable({
  providedIn: 'root'
})
export class PostgameResolver implements Resolve<any> {
  constructor(
    private readonly gameService: GameService,
    private readonly userService: UserService
  ) {}

	getWinningPlayer(data: any) {
		return data.players[0].score > data.players[1].score ? data.players[0].display_name : data.players[1].display_name;
	}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    let postgameData: ResolvedPostGame = {
      duration: 0,
      players: [],
      winner: ''
    };
    postgameData.players = [];
    // console.log(`POSTGAME - GAME ID: ${route.params.id}`);
    return this.gameService.get(route.params.id).pipe(mergeMap((data: PostGameData) =>
    {
      postgameData.duration = (data.duration / 1000);
      const playerNames = Object.keys(data.data.scores);
      // console.log(`RESOLVER - playerNames: ${JSON.stringify(playerNames)}`);
      // return of(postgameData);
      return this.userService.getUsersByLogins(playerNames).pipe(map((users: UserEntity[]) => {
        users.forEach((_, index) => {
          postgameData.players.push({
            intra_name: users[index].intra_name,
            display_name: users[index].display_name,
            score: data.data.scores[playerNames[index]]
          });
        });
        return postgameData;
      }));
    }));
  }
}
