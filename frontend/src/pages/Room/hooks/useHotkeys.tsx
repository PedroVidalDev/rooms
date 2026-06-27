import { useEffect, type MutableRefObject } from 'react';
import { useHotkeys as useReactHotkeys } from 'react-hotkeys-hook';

export type MovementState = {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
};

type UseHotkeysParams = {
  movementRef: MutableRefObject<MovementState>;
  onJump: () => void;
};

export const useHotkeys = ({ movementRef, onJump }: UseHotkeysParams) => {
  const updateMovement = (code: string, pressed: boolean) => {
    switch (code) {
      case 'KeyW':
        movementRef.current.forward = pressed;
        break;
      case 'KeyS':
        movementRef.current.backward = pressed;
        break;
      case 'KeyA':
        movementRef.current.left = pressed;
        break;
      case 'KeyD':
        movementRef.current.right = pressed;
        break;
      default:
        break;
    }
  };

  useReactHotkeys(
    ['w', 'a', 's', 'd'],
    (event) => {
      updateMovement(event.code, event.type === 'keydown');
    },
    {
      keydown: true,
      keyup: true,
    },
    [movementRef],
  );

  useReactHotkeys(
    'space',
    (event) => {
      if (!event.repeat) {
        onJump();
      }
    },
    {
      keydown: true,
      preventDefault: true,
    },
    [onJump],
  );

  useEffect(() => {
    const resetMovement = () => {
      movementRef.current.forward = false;
      movementRef.current.backward = false;
      movementRef.current.left = false;
      movementRef.current.right = false;
    };

    window.addEventListener('blur', resetMovement);

    return () => {
      resetMovement();
      window.removeEventListener('blur', resetMovement);
    };
  }, [movementRef]);
};
