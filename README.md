# bdo-umaru-bot
## Discord.js bot for scraping black desert market queue and coupons
  Сurrently cupons scraping support only russian region

## Run
  To run, you need to create `config.json` similarly to `config-example.json`, specify the token, prefix in it, and optionally change the data storage location.

## Resources used for data scraping
  All valid coupons are taken from the [Orbit-games](https://orbit-games.com/) (ITS ONLY FOR RU REGION)  
  The market queue is taken from [Velia Inn](https://veliainn.com/)  

## Setting on the discord server
  The bot does not have a whitelist on the server, so if you want to use it for personal purposes on a public server, be sure to implement this check. This can be done in the `ready` and `guildCreate` methods.
### BDO
  Edit language with command '!config edit lang `[ru | en]`.  
  The most basic functionality is available immediately with the `!start` command.   
  To add your own items to track, use the `!track [add | remove]`. You can find item IDs at the [code](https://bdocodex.com/en/).
  She can also see all tracked items groups `!track`.  
  If you need to change something pointwise in the config, you can use the `!config edit <key> <new value>` command, where the key can be:
  - `lang` - bot lang
  - `region` - game region
  - `category` - bot channel category id
  - `queue` - id of the market queue channel
  - `coupons` - id of the channel with coupons
  - `coupons_role` - id of the role that is mentioned when publishing coupons
  - `premium` - flag true or false, which is responsible for the possibility of tracking more than 5 product groups on the server.
This parameter can only be changed by the root user, whose id is specified in `config.json`

With the same command, you can view the shortened config of the current server `!config` or the entire `!config json`.
### Others commands
`!help [cmd name or alias]` prints all commands if there are no arguments and brief information about using the command if its name is specified in the argument
`!exec <cmd>` executes the code following the command. The command is available only to the root user
`!umaru [reques]` post a random GIF on request
  
  
