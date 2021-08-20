/* ************************************************************************** */
/*                                                                            */
/*                                                        ::::::::            */
/*   session.entity.ts                                  :+:    :+:            */
/*                                                     +:+                    */
/*   By: tbruinem <tbruinem@student.codam.nl>         +#+                     */
/*                                                   +#+                      */
/*   Created: 2021/08/20 10:35:09 by tbruinem      #+#    #+#                 */
/*   Updated: 2021/08/20 11:13:42 by tbruinem      ########   odam.nl         */
/*                                                                            */
/* ************************************************************************** */

import { IsNotEmpty } from "class-validator";
import { Column, Entity, Index, PrimaryColumn } from "typeorm";

@Entity({name: "session"})
export class SessionEntity {
	@IsNotEmpty()
	@PrimaryColumn("varchar")
	sid: string;

	@IsNotEmpty()
	@Column("json")
	sess: {};
	
	@IsNotEmpty()
	@Column("timestamp without time zone")
	@Index("IDX_session_expire")
	expire: string;
}
