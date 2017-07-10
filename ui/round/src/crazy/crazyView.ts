import { h } from 'snabbdom'
import * as round from '../round';
import { drag } from './crazyCtrl';
import { game } from 'game';
import * as cg from 'chessground/types';
import RoundController from '../ctrl';
import { Position } from '../interfaces';

const eventNames = ['mousedown', 'touchstart'];
const pieceRoles: cg.Role[] = ['pawn', 'knight', 'bishop', 'rook', 'queen'];

export default function pocket(ctrl: RoundController, color: Color, position: Position) {
  const step = round.plyStep(ctrl.data, ctrl.ply);
  if (!step.crazy) return;
  const droppedRole = ctrl.justDropped,
  preDropRole = ctrl.preDrop,
  pocket = step.crazy.pockets[color === 'white' ? 0 : 1],
  usablePos = position === (ctrl.flip ? 'top' : 'bottom'),
  usable = usablePos && !ctrl.replaying() && game.isPlayerPlaying(ctrl.data),
  activeColor = color === ctrl.data.player.color;
  const capturedPiece = ctrl.justCaptured;
  const captured = capturedPiece && (capturedPiece['promoted'] ? 'pawn' : capturedPiece.role);
  return h('div.pocket.is2d.' + position, {
    class: { usable },
    hook: {
      insert: vnode => {
        eventNames.forEach(name => {
          (vnode.elm as HTMLElement).addEventListener(name, (e: cg.MouchEvent) => {
            if (position === (ctrl.flip ? 'top' : 'bottom')) drag(ctrl, e);
          })
        });
      }
    }
  }, pieceRoles.map(role => {
    let nb = pocket[role] || 0;
    if (activeColor) {
      if (droppedRole === role) nb--;
      if (captured === role) nb++;
    }
    return h('piece.' + role + '.' + color, {
      class: { premove: activeColor && preDropRole === role },
      attrs: {
        'data-role': role,
        'data-color': color,
        'data-nb': nb,
      }
    });
  }));
}