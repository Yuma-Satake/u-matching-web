import { HeaderLayout } from '@/components/layout/HeaderLayout';
import { Avatar, Button, Paper, Stack, Typography } from '@mui/material';
import React, { FC, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { UserWithIcon } from '@/types/supabase';
import TinderCard from 'react-tinder-card';
import { supabaseClient } from '@/lib/supabaseClient';

type Props = {
  user: UserWithIcon;
};

/**
 * IndexPage
 */
export const IndexPage: FC<Props> = ({ user }) => {
  const router = useNavigate();
  const [users, setUsers] = useState<UserWithIcon[]>([]);

  useEffect(() => {
    (async () => {
      const res = await supabaseClient.from('users').select('*');
      if (!res.data) return;

      const res2 = await supabaseClient.from('photos').select('*');
      if (!res2.data) return;

      const photos = res2.data;

      const usersWithIcon = res.data
        .filter((u) => u.is_male !== user.is_male)
        .map((user) => {
          const icon = photos.find((photo) => photo.id === user.icon_img_id);
          return { ...user, icon: icon?.img_url ?? '' };
        });
      setUsers([...usersWithIcon, ...usersWithIcon, ...usersWithIcon, ...usersWithIcon]);
    })();
  }, []);

  useEffect(() => {
    if (!user) router('/auth');
  }, [user]);

  const [currentIndex, setCurrentIndex] = useState<number>(0);

  useEffect(() => {
    setCurrentIndex(users.length - 1);
  }, [users]);

  /**
   * レンダリングされても状態を保つ（記録する）
   */
  const currentIndexRef = useRef(currentIndex);
  /**
   * dbのlengthだけuseRefを生成する
   * TinderSwipeを通すことでswipeメソッドとrestoreCardメソッドを付与する(useImperativeHandle)
   */
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const childRefs = useMemo<any>(
    () => [users.length].fill(0).map(() => React.createRef()),
    [users.length]
  );
  /**
   *　useRefを更新する（valは基本 1 or -1 になる）
   */
  const updateCurrentIndex = (val: number) => {
    setCurrentIndex(val);
    currentIndexRef.current = val;
  };

  const outOfFrame = (idx: number) => {
    currentIndexRef.current >= idx && childRefs[idx].current.restoreCard();
  };

  /**
   * 手動でのスワイプの処理（押下式のスワイプも最終的にはこの関数を叩いている）
   * currentIndexを-1する
   */
  const swiped = (direction: string, index: number) => {
    updateCurrentIndex(index - 1);
    if (direction === 'right') {
      setTimeout(() => {
        router(`/profile/${users[index].id}`);
      }, 500);
    }
  };

  return (
    <HeaderLayout withProfile>
      {users.map((u, index) => {
        return (
          <TinderCard
            key={`${u.id}-${index}`}
            preventSwipe={['up', 'down']}
            onSwipe={(dir) => swiped(dir, index)}
            onCardLeftScreen={() => outOfFrame(index)}
          >
            <Button
              sx={{
                position: 'absolute',
                width: '100%',
                height: '85dvh',
                top: 15,
                pointerEvents: 'auto',
              }}
            >
              <Paper
                sx={{
                  position: 'absolute',
                  width: '100%',
                  height: '85dvh',
                  top: 10,
                  borderRadius: 5,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'flex-end',
                  backgroundImage: `url(${u.icon})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  pointerEvents: 'auto',
                }}
              >
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  justifyContent="center"
                  sx={{
                    borderRadius: 5,
                    bgcolor: 'white',
                    p: 1,
                    px: 2,
                    mb: 3,
                    boxShadow: 3,
                  }}
                >
                  <Avatar src={u.icon} sx={{ width: 40, height: 40 }} />
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {u.nickname}
                  </Typography>
                </Stack>
              </Paper>
            </Button>
          </TinderCard>
        );
      })}
    </HeaderLayout>
  );
};
