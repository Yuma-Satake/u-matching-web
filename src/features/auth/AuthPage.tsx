import OutlinedFlagIcon from '@mui/icons-material/OutlinedFlag';
import { HeaderLayout } from '@/components/layout/HeaderLayout';
import { LOCAL_STORAGE_PREFIX } from '@/lib/const';
import { supabaseClient } from '@/lib/supabaseClient';
import { User, UserWithIcon } from '@/types/supabase';
import { Avatar, Button, Modal, Stack, TextField, Typography } from '@mui/material';
import { FC, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

type Props = {
  setUser: (user: UserWithIcon) => void;
};

export const AuthPage: FC<Props> = ({ setUser }) => {
  const router = useNavigate();

  const [users, setUsers] = useState<(User & { icon?: string })[]>([]);
  const [isOpenDialog, setIsOpenDialog] = useState(false);
  const [mail, setMail] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const res = await supabaseClient.from('users').select('*');
      if (!res.data) return;

      const res2 = await supabaseClient.from('photos').select('*');
      if (!res2.data) return;

      const photos = res2.data;

      const usersWithIcon = res.data.map((user) => {
        const icon = photos.find((photo) => photo.id === user.icon_img_id);

        return { ...user, icon: icon?.img_url };
      });

      setUsers(usersWithIcon);
    })();
  }, []);

  return (
    <>
      <HeaderLayout>
        <Stack spacing={1.5}>
          <Typography variant="body2" sx={{ fontWeight: 'bold', pt: 2 }}>
            自分のアカウントを選択
          </Typography>
          <Stack spacing={0.5}>
            {users.map((user) => (
              <Button
                key={user.id}
                variant="text"
                fullWidth
                sx={{ justifyContent: 'flex-start', color: 'black' }}
                onClick={() => {
                  localStorage.removeItem(`${LOCAL_STORAGE_PREFIX}MAIL`);
                  const mail = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}MAIL`);
                  if (!mail) {
                    setIsOpenDialog(true);
                    setSelectedUserId(user.id);
                    return;
                  }
                  router('/');
                }}
              >
                <Stack
                  key={user.id}
                  direction="row"
                  spacing={2}
                  alignItems="center"
                  justifyContent="flex-start"
                >
                  <Avatar
                    sx={{ width: 50, height: 50 }}
                    src={user.icon ?? user.name_line}
                    alt={user.name_line}
                  />
                  <Typography
                    sx={{
                      fontWeight: 'bold',
                    }}
                  >
                    {user.name_line}
                  </Typography>
                </Stack>
              </Button>
            ))}
          </Stack>
        </Stack>
      </HeaderLayout>
      <Modal
        open={isOpenDialog}
        onClose={() => setIsOpenDialog(false)}
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 'calc(100dvw - 25px)',
          boxShadow: 24,
          m: 0,
          borderRadius: '15px',
          overflowY: 'auto',
          bgcolor: 'white',
          zIndex: 5,
          height: 'fit-content',
        }}
      >
        <Stack
          spacing={2}
          sx={{
            p: 3,
            py: 5,
            pt: 3.5,
            bgcolor: 'white',
            height: 'fit-content',
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
            メールアドレスを入力してください
          </Typography>
          <TextField
            variant="filled"
            value={mail}
            onChange={(e) => setMail(e.target.value)}
            type="email"
          />
          <Stack
            direction="row"
            spacing={2}
            sx={{
              width: '100%',
              justifyContent: 'stretch',
            }}
          >
            <Button
              variant="outlined"
              color="primary"
              onClick={() => {
                setIsOpenDialog(false);
              }}
              sx={{
                width: '100%',
              }}
            >
              キャンセル
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={async () => {
                if (!selectedUserId) return;

                /**
                 * 該当のユーザidのメールアドレスを取得してみて、もし取得できたら比較する
                 * 比較した結果、一致したらログインする
                 *
                 * 取得できなかったら、そのまま登録する
                 */
                const fetchMail = await supabaseClient
                  .from('users')
                  .select('mail')
                  .eq('id', selectedUserId);

                console.log(fetchMail.data);

                if (fetchMail.data && fetchMail.data[0].mail && fetchMail.data[0].mail !== mail) {
                  alert('初回に使用したメールアドレスを入力してください');
                  return;
                }

                localStorage.setItem(`${LOCAL_STORAGE_PREFIX}MAIL`, mail);
                localStorage.setItem(`${LOCAL_STORAGE_PREFIX}USER_ID`, selectedUserId);
                setIsOpenDialog(false);
                await supabaseClient.from('users').update({ mail }).eq('id', selectedUserId);

                setUser(users.find((user) => user.id === selectedUserId) as UserWithIcon);

                router('/');
              }}
              endIcon={<OutlinedFlagIcon />}
              sx={{
                fontWeight: 'bold',
                color: 'white',
                width: '100%',
              }}
            >
              ログイン
            </Button>
          </Stack>
        </Stack>
      </Modal>
    </>
  );
};
