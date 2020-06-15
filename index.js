// Extract the required classes from the discord.js module
const { Client, MessageEmbed, Guild } = require('discord.js');
const nlp = require('compromise')
nlp.extend(require('compromise-sentences'))
var fs = require('fs')
// Create an instance of a Discord client
const client = new Client();
var chann = "";
var currAction = null;
var newProd = null;
var newProdUser = null;
var newProdId = null;
var database;
var logChann;
var delProd;
var editProdI;
var editField;
var editProdID;
var editProdNew;
client.once('ready', () => {

    fs.readFile('db.json', function (err, data) {
        if (err) {
            logChann.send(err)
            throw err;
        }
        database = JSON.parse(data);
        updateProdList();
        chann = client.channels.cache.get(database.logchann);
        chann.send("```>_ K E V I N   H A S   B E E N   R E L O A D E D```")
        console.log('Logged in as ' + client.user);
        client.user.setStatus('online')



        client.user.setPresence({
            activity: { name: 'thekey.company', url: "https://thekey.company" }, status: 'WATCHING'
        });
    })
});
client.login("NzIwNDQzNTU5NDg4MTI2OTg2.XuGDpg.f3tQXG47t-pPIA5jSWFdHXZIYVk");

client.on('message', message => {
    var kbChann = client.channels.cache.get(database.kbchann);
    var kcChann = client.channels.cache.get(database.kcchann);
    var mcChann = client.channels.cache.get(database.mcchann);
    if (message.member.id != "714602541157187665") {
        if (message.channel.id == database.verifchann) {
            if (message.content.toLowerCase().startsWith("k.marko")) {
                let role = message.guild.roles.cache.find(r => r.name === "verified");
                message.delete()
                message.member.roles.add(role)
            }
        }
        if (currAction == "edit_choose") {
            prod = database.products[parseInt(message.content, 10) - 1]
            editProdI = parseInt(message.content, 10) - 1
            editEmbed = new MessageEmbed()
                .setTitle("**EDIT PRODUCT**")
                .setColor("#8fffab")
                .setDescription(`**${database.products[parseInt(message.content, 10) - 1].name}**
                                \nSelect the field you would like to edit
                                \n
                                \nN - Name
                                \n*Currently: ${prod.name}*
                                \nL - Link
                                \n*Currently: ${prod.link}*
                                \nS - Group Buy Start Date
                                \n*Currently: ${prod.gbStart}*
                                \nE - Group Buy End Date
                                \n*Currently: ${prod.gbEnd}*`);
            message.channel.messages.fetch({ around: editProdID, limit: 1 }).then(msg => {
                const fetchedMsg = msg.first();
                fetchedMsg.edit(editEmbed);
                message.delete()
            });
            currAction = "edit_field"
        } else if (currAction == "edit_field") {
            var editEmbed = new MessageEmbed()
                .setTitle("**EDIT PRODUCT**")
                .setColor("#8fffab");
            if (message.content.toLowerCase() == "n" || message.content.toLowerCase() == "name") {
                editField = "name"
                editEmbed.setDescription('Enter the New Name')
            } else if (message.content.toLowerCase() == "l" || message.content.toLowerCase() == "link") {
                editField = "link"
                editEmbed.setDescription('Enter the New Link')
            } else if (message.content.toLowerCase() == "s" || message.content.toLowerCase() == "Group Buy Start Date" || message.content.toLowerCase() == "Start Date" || message.content.toLowerCase() == "Start") {
                editField = "start"
                editEmbed.setDescription('Enter the New Start Date').addField('MM/DD/YYYY format or N/A', "_ _")
            } else if (message.content.toLowerCase() == "e" || message.content.toLowerCase() == "Group Buy End Date" || message.content.toLowerCase() == "End Date" || message.content.toLowerCase() == "End") {
                editField = "end"
                editEmbed.setDescription('Enter the New End Date').addField('MM/DD/YYYY format or N/A', "_ _")
            }
            message.channel.messages.fetch({ around: editProdID, limit: 1 }).then(msg => {
                const fetchedMsg = msg.first();
                fetchedMsg.edit(editEmbed);
                message.delete()
            });
            currAction = "edit_input"

        } else if (currAction == "edit_input") {
            const editEmbed = new MessageEmbed().setTitle("**EDIT PRODUCT**")
                .setColor("#8fffab");

            if (editField == "name" || editField == "link") {
                editProdNew = message.content
                editEmbed.setDescription("Please confirm that the `" + editField + "` change is correct." + `\n${database.products[editProdI][editField]} -> ${editProdNew}`).addField('Reply with "yes" to confirm this change, or "no" to abort the process', "_ _");

                currAction = "edit_conf"
            } else if (editField == "start" || editField == "end") {
                if (isDate(message.content) || message.content.toLowerCase() == "n/a" || message.content.toLowerCase() == "na") {
                    editProdNew = message.content
                    editEmbed.setDescription("Please confirm that the `" + editField + "` change is correct." + `\n${database.products[editProdI]["gb" + editField.charAt(0).toUpperCase() + editField.slice(1)]} -> ${editProdNew}`).addField('Reply with "yes" to confirm this change, or "no" to abort the process', "_ _");

                    currAction = "edit_conf"
                } else {
                    editEmbed.setDescription("Entry wasnt a valid date. Please enter a new date in the MM/DD/YYYY format.")
                        .setTitle("**ENTRY ERROR**")
                        .setColor("#ff8f8f");
                }
            }
            message.channel.messages.fetch({ around: editProdID, limit: 1 }).then(msg => {
                const fetchedMsg = msg.first();
                fetchedMsg.edit(editEmbed);
            }); message.delete();

        } else if (currAction == "edit_conf") {
            var editEmbed;
            if (message.content.toLowerCase() == "y" || message.content.toLowerCase() == "yes") {
                editEmbed = new MessageEmbed().setTitle("**PRODUCT EDITED**")
                    .setColor("#8fffab");
                var oldName = database.products[editProdI].name;
                if (editField == "name") {
                    database.products[editProdI].name = editProdNew
                } else if (editField == "link") {
                    database.products[editProdI].link = editProdNew
                } else if (editField == "start") {
                    database.products[editProdI].gbStart = editProdNew
                } else if (editField == "end") {
                    database.products[editProdI].gbEnd = editProdNew
                }
                var guild = client.guilds.cache.get()
                client.channels.cache.get(database.products[editProdI].chanId).edit({
                    topic: `${database.products[editProdI].emote} GB from ${database.products[editProdI].gbStart} to ${database.products[editProdI].gbEnd} | ${database.products[editProdI].link}`,
                    name: database.products[editProdI].name,
                }).then(() => {
                    message.guild.roles.cache.find(c => c.id === database.products[editProdI].roleId).edit({ name: database.products[editProdI].name }).then(() => {
                        fs.writeFile('db.json', JSON.stringify(database), (err) => {
                            if (err) {
                                message.channel.send(err)
                                throw err;
                            }

                        });
                    })
                })



            } else if (message.content.toLowerCase() == "n" || message.content.toLowerCase() == "no") {
                editEmbed = new MessageEmbed().setTitle("**PRODUCT EDITING CANCELLED**")
                    .setColor("#ff8f8f");
            }
            message.channel.messages.fetch({ around: editProdID, limit: 1 }).then(msg => {
                const fetchedMsg = msg.first();
                fetchedMsg.edit(editEmbed);
            }); message.delete();
        }
        if (message.content.startsWith("k.edit")) {
            var editEmbed;
            var descString = "Send the number of the product you would like to edit!\n";
            //message.channel.startTyping();
            for (let i = 0; i < database.products.length; i++) {
                const prod = database.products[i];
                descString += ("_ _", "`" + (i + 1) + "` - " + prod.name + '\n')
            }
            /*setTimeout(() => {
                message.channel.stopTyping();
            },1000)*/
            editEmbed = new MessageEmbed()
                .setTitle("**EDIT PRODUCT**")
                .setColor("#8fffab")
                .setDescription(descString);
            message.channel.send(editEmbed).then(msg => { editProdID = msg.id })
            currAction = "edit_choose"
        }
        if (message.content.startsWith("k.evin") && message.author.id == "180929397107326976") {
            var msgArr = ["hello", "i am kevin", "i am a cybernetic interface designed to assist TKC with this server", "i was also designed to send whats known as a hilarious image at the call of a command", "try using k.help in #bot-commands to see what you can use"]
            message.channel.send("```>_ " + msgArr[0].toUpperCase().split('').join(' ') + "```")
            message.channel.startTyping();
            setTimeout(() => {
                message.channel.stopTyping();
                message.channel.send("```>_ " + msgArr[1].toUpperCase().split('').join(' ') + "```")
                setTimeout(() => {
                    message.channel.startTyping();
                    setTimeout(() => {
                        message.channel.stopTyping();
                        message.channel.send("```>_ " + msgArr[2].toUpperCase().split('').join(' ') + "```")
                        setTimeout(() => {
                            message.channel.startTyping();
                            setTimeout(() => {
                                message.channel.stopTyping();
                                message.channel.send("```>_ " + msgArr[3].toUpperCase().split('').join(' ') + "```")
                                setTimeout(() => {
                                    message.channel.startTyping();
                                    setTimeout(() => {
                                        message.channel.stopTyping();
                                        message.channel.send("```>_ " + msgArr[4].toUpperCase().split('').join(' ') + "```")
                                    }, 2000)
                                }, 1000)
                            }, 4500)
                        }, 1000)
                    }, 4000)
                }, 1000)
            }, 2000)
        }
        if (message.content.startsWith("k.help")) {
            if (message.member.roles.cache.find(r => r.name === "Mods") || message.member.id == "180929397107326976"){
                message.channel.send(new MessageEmbed()
                .setTitle("**K E V I N   H E L P**")
                .setColor("#8fffab")
                .addFields(
                    { name: 'k.help', value: 'You are here. Displays a help message for `k e v i n`' },
                    { name: 'k.send', value: 'Sends a dummy message. Mostly used for debug purposes' },
                    { name: 'k.editMsg [message id] [new message]', value: 'Edits a message sent by `k e v i n` *Example:* `k.edit 718595494032703591 This is an edited message`' },
                    { name: 'k.new', value: 'Starts product creation prompt for a new product' },
                    { name: 'k.setup', value: 'Starts product setup prompt for pre-existing product & channel. Run this in the channel ' },
                    { name: 'k.exit', value: 'Exits product creation process' },
                    { name: 'k.remove [product name]', value: 'Deletes a product. **WARNING** this action can *not* be undone! *Example:* `k.remove chicken nuggies`' },
                    { name: 'k.extras', value: 'Sends the infamous image' },
                    { name: 'k.fried OR k.friedextras', value: 'Sends the infamous image, but deepfried' },
                    { name: 'k.soon', value: 'Soon:tm:' },
                ));
            }else{ message.channel.send(new MessageEmbed()
                .setTitle("**K E V I N   H E L P**")
                .setColor("#8fffab")
                .addFields(
                    { name: 'k.help', value: 'You are here. Displays a help message for `k e v i n`' },
                    { name: 'k.extras', value: 'Sends the infamous image' },
                    { name: 'k.fried OR k.friedextras', value: 'Sends the infamous image, but deepfried' },
                    { name: 'k.soon', value: 'Soon:tm:' },
                ));}
        }
        if (message.content.startsWith("k.send")) {
            message.channel.send("dummy message");
            message.delete();
        }
        if (message.content.startsWith("k.editMsg")) {
            var id = message.content.split(" ").splice(1, 1)
            var newMsg = message.content.split(" ").splice(2).join(" ")
            message.channel.messages.fetch({ around: id, limit: 1 }).then(msg => {
                const fetchedMsg = msg.first();
                if (fetchedMsg.author.id == "714602541157187665") {
                    fetchedMsg.edit(newMsg);
                } else {
                    message.channel.send(new MessageEmbed()
                        .setTitle("**COMMAND FAILED**")
                        .setColor("#ff8f8f")
                        .setDescription("I did not send that message."))
                }
            });
        }
        if (message.channel.id == database.kevinspeak) {
            var channel = message.member.guild.channels.cache.find(ch => ch.name === 'general');
            channel.send("```>_ " + message.content.toUpperCase().split('').join(' ') + "```")
            message.delete()
        }
        if (message.content.startsWith("k.remove")) {
            delProd = message.content.substring(9);
            message.channel.send(new MessageEmbed()
                .setTitle("**ARE YOU SURE YOU WANT TO DO THIS?**")
                .setDescription("This cannot be undone")
                .addField("Please reply with 'yes' or 'no'", "_ _")
                .setColor("#ff8f8f"));
            currAction = "prod_remove";

        }
        if (currAction == "prod_remove") {
            var found = false;
            var index;
            for (let i = 0; i < database.products.length; i++) {
                const prod = database.products[i];
                if (delProd == prod.name && found == false) {
                    index = i;
                    found = true;
                }
            }
            if (found && message.content.startsWith("yes")) {
                function deleteProd(msg) {
                    message.guild.roles.cache.get(database.products[index].roleId).delete().then(() => {
                        client.channels.cache.get(`${database.products[index].chanId}`).delete().then(() => {
                            database.products.splice(index, 1)
                            msg.reactions.cache.get(`${database.emotes[index]}`).remove().then(() => {
                                database.emotes.splice(index, 1)
                                database.roles.splice(index, 1)
                                fs.writeFile('db.json', JSON.stringify(database), (err) => {
                                    if (err) {
                                        message.channel.send(err)
                                        throw err;
                                    }
                                });
                            })

                        })

                    })

                }

                if (database.products[index].type == "Keyboards") {
                    client.channels.cache.get("718228807189790741").messages.fetch(database.kbrr[Math.floor(index / 20)]).then(msg => {
                        //const fetchedMsg = msg.first();
                        message.guild.roles.cache.get(database.products[index].roleId).delete().then(() => {
                            client.channels.cache.get(`${database.products[index].chanId}`).delete().then(() => {
                                database.products.splice(index, 1)
                                msg.reactions.cache.get(`${database.emotes[index]}`).remove().then(() => {
                                    database.emotes.splice(index, 1)
                                    database.roles.splice(index, 1)
                                    fs.writeFile('db.json', JSON.stringify(database), (err) => {
                                        if (err) {
                                            message.channel.send(err)
                                            throw err;
                                        }
                                    });
                                })

                            })

                        })
                    });
                } else if (database.products[index].type == "Keycaps") {
                    client.channels.cache.get("718228767671320688").messages.fetch(database.kcrr[Math.floor(index / 20)]).then(msg => {
                        //const fetchedMsg = msg.first();
                        message.guild.roles.cache.get(database.products[index].roleId).delete().then(() => {
                            client.channels.cache.get(`${database.products[index].chanId}`).delete().then(() => {
                                database.products.splice(index, 1)
                                msg.reactions.cache.get(`${database.emotes[index]}`).remove().then(() => {
                                    database.emotes.splice(index, 1)
                                    database.roles.splice(index, 1)
                                    fs.writeFile('db.json', JSON.stringify(database), (err) => {
                                        if (err) {
                                            message.channel.send(err)
                                            throw err;
                                        }
                                    });
                                })

                            })

                        })
                    });
                } else if (database.products[index].type == "Miscellaneous") {
                    client.channels.cache.get("718228835971235883").messages.fetch(database.mcrr[Math.floor(index / 20)]).then(msg => {
                        //const fetchedMsg = msg.first();
                        message.guild.roles.cache.get(database.products[index].roleId).delete().then(() => {
                            client.channels.cache.get(`${database.products[index].chanId}`).delete().then(() => {
                                database.products.splice(index, 1)
                                msg.reactions.cache.get(`${database.emotes[index]}`).remove().then(() => {
                                    database.emotes.splice(index, 1)
                                    database.roles.splice(index, 1)
                                    fs.writeFile('db.json', JSON.stringify(database), (err) => {
                                        if (err) {
                                            message.channel.send(err)
                                            throw err;
                                        }
                                    });
                                })

                            })

                        })
                    });
                }


                updateProdList()
                message.channel.send(new MessageEmbed()
                    .setTitle("**PRODUCT DELETED SUCCESSFULLY**")
                    .setColor("#8fffab"));

            } else if (found && message.content.startsWith("no")) {

                message.channel.send(new MessageEmbed()
                    .setTitle("**ACTION CANCELLED**")
                    .setColor("#8fffab"));

            } else if (found == false) {
                message.channel.send(new MessageEmbed()
                    .setTitle("**COMMAND FAILED**")
                    .setColor("#ff8f8f")
                    .setDescription("That is not a valid product. Please try again"));
            }
        }
        if (message.content.startsWith("k.purge")) {
            message.channel.bulkDelete(100)
        }
        if (newProdUser == message.member.id) {
            if (message.content.startsWith("k.exit")) {
                if (currAction != null) {
                    const DeleteEmbed = new MessageEmbed()
                        .setTitle("**SETUP CANCELLED**")
                        .setColor("#ff8f8f")
                    message.channel.send(DeleteEmbed)
                    currAction = null
                    newProd = ""
                    newProdUser = null;
                }
            }
            if (currAction == "prod_name") {
                if (database.roles.indexOf(message.content) == -1) {
                    newProd = { name: message.content }
                    const DeleteEmbed = new MessageEmbed()
                        .setTitle("**NEW PRODUCT**")
                        .setColor("#8fffab")
                        .setDescription("Enter Products Link");
                    message.channel.messages.fetch({ around: newProdId, limit: 1 }).then(msg => {
                        const fetchedMsg = msg.first();
                        fetchedMsg.edit(DeleteEmbed);
                    });
                    message.delete();
                    currAction = "prod_link"
                } else {
                    const DeleteEmbed = new MessageEmbed()
                        .setTitle("**ENTRY ERROR**")
                        .setColor("#ff8f8f")
                        .setDescription("That name is already in use. Please try again");
                    message.channel.messages.fetch({ around: newProdId, limit: 1 }).then(msg => {
                        const fetchedMsg = msg.first();
                        fetchedMsg.edit(DeleteEmbed);
                    }); message.delete();
                }
            } else if (currAction == "prod_link") {
                if (validURL(message.content)) {
                    newProd.link = message.content
                    const DeleteEmbed = new MessageEmbed()
                        .setTitle("**NEW PRODUCT**")
                        .setColor("#8fffab")
                        .setDescription("Enter Product Type")
                        .addFields(
                            { name: 'Possible Types (Case Sensitive)', value: 'Kc | Kb | Mc' },
                            { name: 'What they mean', value: 'Kc: Keycaps | Kb: Keyboard | Mc: Miscellaneous' },
                        )
                        .addField("MAKE SURE THIS IS CORRECT, AS IT CANNOT BE CHANGED AFTER THE PRODUCT HAS BEEN CREATED", "_ _", true);
                    message.channel.messages.fetch({ around: newProdId, limit: 1 }).then(msg => {
                        const fetchedMsg = msg.first();
                        fetchedMsg.edit(DeleteEmbed);
                    }); message.delete();
                    currAction = "prod_type"
                } else {
                    const DeleteEmbed = new MessageEmbed()
                        .setTitle("**ENTRY ERROR**")
                        .setColor("#ff8f8f")
                        .setDescription("Entry wasnt valid URL. Please enter a valid URL.");
                    message.channel.messages.fetch({ around: newProdId, limit: 1 }).then(msg => {
                        const fetchedMsg = msg.first();
                        fetchedMsg.edit(DeleteEmbed);
                    }); message.delete();
                }
            } else if (currAction == "prod_type") {
                if (message.content.startsWith("Kc") || message.content.startsWith("Kb") || message.content.startsWith("Mc") ||
                    message.content.startsWith("kc") || message.content.startsWith("kb") || message.content.startsWith("mc") ||
                    message.content.startsWith("Keycaps") || message.content.startsWith("Keycap") || message.content.startsWith("Keyboard") ||
                    message.content.startsWith("Misc") || message.content.startsWith("Miscellaneous") || message.content.startsWith("keycaps") ||
                    message.content.startsWith("keycap") || message.content.startsWith("keyboard") || message.content.startsWith("misc") || message.content.startsWith("miscellaneous")) {
                    var prodType;
                    if (message.content.startsWith("Kc") || message.content.startsWith("kc") ||
                        message.content.startsWith("Keycaps") || message.content.startsWith("Keycap") || message.content.startsWith("keycaps") ||
                        message.content.startsWith("keycap")) {
                        prodType = "Keycaps"
                    } else if (message.content.startsWith("Kb") || message.content.startsWith("kb") || message.content.startsWith("Keyboard") || message.content.startsWith("keyboard")) {
                        prodType = "Keyboards"
                    } else if (message.content.startsWith("Mc") || message.content.startsWith("mc") || message.content.startsWith("Misc") || message.content.startsWith("Miscellaneous") ||
                        message.content.startsWith("misc") || message.content.startsWith("miscellaneous")) {
                        prodType = "Miscellaneous"
                    }
                    newProd.type = prodType
                    const DeleteEmbed = new MessageEmbed()
                        .setTitle("**NEW PRODUCT**")
                        .setColor("#8fffab")
                        .setDescription("Enter Products Emote")
                        .addField("MAKE SURE THIS IS CORRECT, AS IT CANNOT BE CHANGED AFTER THE PRODUCT HAS BEEN CREATED", "_ _", true);
                    message.channel.messages.fetch({ around: newProdId, limit: 1 }).then(msg => {
                        const fetchedMsg = msg.first();
                        fetchedMsg.edit(DeleteEmbed);
                    }); message.delete();
                    currAction = "prod_emote"
                } else {
                    const DeleteEmbed = new MessageEmbed()
                        .setTitle("**ENTRY ERROR**")
                        .setColor("#ff8f8f")
                        .setDescription("Entry wasnt valid. Please enter one of the following: Kb, Kc, Mc, Keycaps, Keyboard, Misc, or Miscellaneous.");
                    message.channel.messages.fetch({ around: newProdId, limit: 1 }).then(msg => {
                        const fetchedMsg = msg.first();
                        fetchedMsg.edit(DeleteEmbed);
                    }); message.delete();
                }
            } else if (currAction == "prod_emote") {
                if (database.emotes.indexOf(message.content) == -1) {
                    newProd.emote = message.content
                    const DeleteEmbed = new MessageEmbed()
                        .setTitle("**NEW PRODUCT**")
                        .setColor("#8fffab")
                        .setDescription("Enter Group Buy Start Date or N/A for products in IC, or in-stock products")
                        .addFields(
                            { name: 'MM/DD/YYYY format OR N/A', value: '_ _' },
                        );
                    message.channel.messages.fetch({ around: newProdId, limit: 1 }).then(msg => {
                        const fetchedMsg = msg.first();
                        fetchedMsg.edit(DeleteEmbed);
                    }); message.delete();
                    currAction = "prod_start"
                } else {
                    const DeleteEmbed = new MessageEmbed()
                        .setTitle("**ENTRY ERROR**")
                        .setColor("#ff8f8f")
                        .setDescription("That emote is already in use. Please try again");
                    message.channel.messages.fetch({ around: newProdId, limit: 1 }).then(msg => {
                        const fetchedMsg = msg.first();
                        fetchedMsg.edit(DeleteEmbed);
                    }); message.delete();
                }
            } else if (currAction == "prod_start") {
                if (message.content.startsWith("N/A") || message.content.startsWith("N/a") || message.content.startsWith("n/a") || message.content.startsWith("NA") || message.content.startsWith("Na") || message.content.startsWith("na")) {
                    newProd.gbStart = "N/A"
                    newProd.gbEnd = "N/A"
                    const DeleteEmbed = new MessageEmbed()
                        .setTitle("**NEW PRODUCT**")
                        .setColor("#8fffab")
                        .setDescription("Check If All Info Is Correct!")
                        .addFields(
                            { name: 'Name', value: newProd.name },
                            { name: 'Link', value: newProd.link },
                            { name: 'Category', value: newProd.type },
                            { name: 'Emote', value: newProd.emote },
                            { name: 'Group Buy Start Date', value: newProd.gbStart },
                            { name: 'Group Buy End Date', value: newProd.gbEnd },
                            { name: 'Reply with "yes" if all info is correct, reply "no" to abort the product creation.', value: "_ _" },
                        );
                    message.channel.messages.fetch({ around: newProdId, limit: 1 }).then(msg => {
                        const fetchedMsg = msg.first();
                        fetchedMsg.edit(DeleteEmbed);
                    }); message.delete();
                    currAction = "prod_confirm"
                } else if (isDate(message.content)) {
                    newProd.gbStart = message.content
                    const DeleteEmbed = new MessageEmbed()
                        .setTitle("**NEW PRODUCT**")
                        .setColor("#8fffab")
                        .setDescription("Enter Group Buy End Date")
                        .addFields(
                            { name: 'MM/DD/YYYY format', value: '_ _' },
                        );
                    message.channel.messages.fetch({ around: newProdId, limit: 1 }).then(msg => {
                        const fetchedMsg = msg.first();
                        fetchedMsg.edit(DeleteEmbed);
                    }); message.delete();
                    currAction = "prod_end"
                } else {
                    const DeleteEmbed = new MessageEmbed()
                        .setTitle("**ENTRY ERROR**")
                        .setColor("#ff8f8f")
                        .setDescription("Entry wasnt a valid date. Please enter a new date in the MM/DD/YYYY format.");
                    message.channel.messages.fetch({ around: newProdId, limit: 1 }).then(msg => {
                        const fetchedMsg = msg.first();
                        fetchedMsg.edit(DeleteEmbed);
                    }); message.delete();
                }
            } else if (currAction == "prod_end") {
                if (isDate(message.content) && newProd.gbStart < message.content) {
                    newProd.gbEnd = message.content
                    const DeleteEmbed = new MessageEmbed()
                        .setTitle("**NEW PRODUCT**")
                        .setColor("#8fffab")
                        .setDescription("Check If All Info Is Correct!")
                        .addFields(
                            { name: 'Name', value: newProd.name },
                            { name: 'Link', value: newProd.link },
                            { name: 'Category', value: newProd.type },
                            { name: 'Emote', value: newProd.emote },
                            { name: 'Group Buy Start Date', value: newProd.gbStart },
                            { name: 'Group Buy End Date', value: newProd.gbEnd },
                            { name: 'Reply with "yes" if all info is correct, reply "no" to abort the product creation.', value: "_ _" },
                        );
                    message.channel.messages.fetch({ around: newProdId, limit: 1 }).then(msg => {
                        const fetchedMsg = msg.first();
                        fetchedMsg.edit(DeleteEmbed);
                    }); message.delete();
                    currAction = "prod_confirm"
                } else if (isDate(message.content) != true) {
                    const DeleteEmbed = new MessageEmbed()
                        .setTitle("**ENTRY ERROR**")
                        .setColor("#ff8f8f")
                        .setDescription("Entry wasnt a valid date. Please enter a new date in the MM/DD/YYYY format.");
                    message.channel.messages.fetch({ around: newProdId, limit: 1 }).then(msg => {
                        const fetchedMsg = msg.first();
                        fetchedMsg.edit(DeleteEmbed);
                    }); message.delete();
                } else if (newProd.gbStart > message.content) {
                    const DeleteEmbed = new MessageEmbed()
                        .setTitle("**ENTRY ERROR**")
                        .setColor("#ff8f8f")
                        .setDescription("The Group Buy end date can't be before the start date. Please enter a date later than " + newProd.gbStart);
                    message.channel.messages.fetch({ around: newProdId, limit: 1 }).then(msg => {
                        const fetchedMsg = msg.first();
                        fetchedMsg.edit(DeleteEmbed);
                    }); message.delete();
                } else if (newProd.gbStart == message.content) {
                    const DeleteEmbed = new MessageEmbed()
                        .setTitle("**ENTRY ERROR**")
                        .setColor("#ff8f8f")
                        .setDescription("The Group Buy end date can't be the same as the start date. Please enter a date later than " + newProd.gbStart);
                    message.channel.messages.fetch({ around: newProdId, limit: 1 }).then(msg => {
                        const fetchedMsg = msg.first();
                        fetchedMsg.edit(DeleteEmbed);
                    }); message.delete();
                }
            } else if (currAction == "prod_confirm") {
                if (message.content.includes("YES") || message.content.includes("Yes") || message.content.includes("yes")) {
                    var server = message.guild;


                    message.guild.roles.create({
                        data: {
                            name: newProd.name
                        }
                    }).then(role => {
                        server.channels.create(newProd.emote + " " +newProd.name, {
                            topic: `${newProd.emote} GB from ${newProd.gbStart} to ${newProd.gbEnd} | ${newProd.link}`,
                            parent: server.channels.cache.find(c => c.name == newProd.type && c.type == "category"),
                            permissionOverwrites: [
                                {
                                    id: role.id,
                                    allow: ['VIEW_CHANNEL']
                                }, {
                                    id: message.guild.id, // @everyone role
                                    deny: ['VIEW_CHANNEL']
                                }
                            ]
                        }).then(channel => {
                            newProd.roleId = role.id;
                            newProd.chanId = channel.id;
                            const DeleteEmbed = new MessageEmbed()
                                .setTitle("**NEW PRODUCT**")
                                .setColor("#8fffab")
                                .setDescription("New Product Created!");
                            message.channel.messages.fetch({ around: newProdId, limit: 1 }).then(msg => {
                                const fetchedMsg = msg.first();
                                fetchedMsg.edit(DeleteEmbed);
                            }); message.delete();
                            currAction = null
                            newProdUser = null;
                            var newJson;
                            fs.readFile('db.json', function (err, data) {
                                if (err) {
                                    message.channel.send(err)
                                    throw err;
                                }
                                var json = JSON.parse(data)
                                console.dir(json)
                                json.products.push(newProd)
                                json.emotes.push(newProd.emote)
                                json.roles.push(newProd.name);
                                newJson = json;
                                console.dir(json)
                                fs.writeFile('db.json', JSON.stringify(json), (err) => {
                                    if (err) {
                                        message.channel.send(err)
                                        throw err;
                                    }
                                });
                            })
                        })

                    }).catch(console.error);



                } else if (message.content.includes("NO") || message.content.includes("no") || message.content.includes("No") || message.content.includes("nO")) {
                    const DeleteEmbed = new MessageEmbed()
                        .setTitle("**ENTRY CANCELLED**")
                        .setColor("#ff8f8f")
                    message.channel.messages.fetch({ around: newProdId, limit: 1 }).then(msg => {
                        const fetchedMsg = msg.first();
                        fetchedMsg.edit(DeleteEmbed);
                    }); message.delete();
                    currAction = null
                    newProd = ""
                    newProdUser = null;
                }
                updateProdList()
            } else if (currAction == "stp_prod_name") {
                if (database.roles.indexOf(message.content) == -1) {
                    newProd = { name: message.content }
                    const DeleteEmbed = new MessageEmbed()
                        .setTitle("**NEW PRODUCT**")
                        .setColor("#8fffab")
                        .setDescription("Enter Products Link");
                    message.channel.messages.fetch({ around: newProdId, limit: 1 }).then(msg => {
                        const fetchedMsg = msg.first();
                        fetchedMsg.edit(DeleteEmbed);
                    });
                    message.delete();
                    currAction = "stp_prod_link"
                } else {
                    const DeleteEmbed = new MessageEmbed()
                        .setTitle("**ENTRY ERROR**")
                        .setColor("#ff8f8f")
                        .setDescription("That name is already in use. Please try again");
                    message.channel.messages.fetch({ around: newProdId, limit: 1 }).then(msg => {
                        const fetchedMsg = msg.first();
                        fetchedMsg.edit(DeleteEmbed);
                    }); message.delete();
                }
            } else if (currAction == "stp_prod_link") {
                if (validURL(message.content)) {
                    newProd.link = message.content
                    const DeleteEmbed = new MessageEmbed()
                        .setTitle("**NEW PRODUCT**")
                        .setColor("#8fffab")
                        .setDescription("Enter Product Type")
                        .addFields(
                            { name: 'Possible Types (Case Sensitive)', value: 'Kc | Kb | Mc' },
                            { name: 'What they mean', value: 'Kc: Keycaps | Kb: Keyboard | Mc: Miscellaneous' },
                        )
                        .addField("MAKE SURE THIS IS CORRECT, AS IT CANNOT BE CHANGED AFTER THE PRODUCT HAS BEEN CREATED", "_ _", true);
                    message.channel.messages.fetch({ around: newProdId, limit: 1 }).then(msg => {
                        const fetchedMsg = msg.first();
                        fetchedMsg.edit(DeleteEmbed);
                    }); message.delete();
                    currAction = "stp_prod_type"
                } else {
                    const DeleteEmbed = new MessageEmbed()
                        .setTitle("**ENTRY ERROR**")
                        .setColor("#ff8f8f")
                        .setDescription("Entry wasnt valid URL. Please enter a valid URL.");
                    message.channel.messages.fetch({ around: newProdId, limit: 1 }).then(msg => {
                        const fetchedMsg = msg.first();
                        fetchedMsg.edit(DeleteEmbed);
                    }); message.delete();
                }
            } else if (currAction == "stp_prod_type") {
                if (message.content.startsWith("Kc") || message.content.startsWith("Kb") || message.content.startsWith("Mc") ||
                    message.content.startsWith("kc") || message.content.startsWith("kb") || message.content.startsWith("mc") ||
                    message.content.startsWith("Keycaps") || message.content.startsWith("Keycap") || message.content.startsWith("Keyboard") ||
                    message.content.startsWith("Misc") || message.content.startsWith("Miscellaneous") || message.content.startsWith("keycaps") ||
                    message.content.startsWith("keycap") || message.content.startsWith("keyboard") || message.content.startsWith("misc") || message.content.startsWith("miscellaneous")) {
                    var prodType;
                    if (message.content.startsWith("Kc") || message.content.startsWith("kc") ||
                        message.content.startsWith("Keycaps") || message.content.startsWith("Keycap") || message.content.startsWith("keycaps") ||
                        message.content.startsWith("keycap")) {
                        prodType = "Keycaps"
                    } else if (message.content.startsWith("Kb") || message.content.startsWith("kb") || message.content.startsWith("Keyboard") || message.content.startsWith("keyboard")) {
                        prodType = "Keyboards"
                    } else if (message.content.startsWith("Mc") || message.content.startsWith("mc") || message.content.startsWith("Misc") || message.content.startsWith("Miscellaneous") ||
                        message.content.startsWith("misc") || message.content.startsWith("miscellaneous")) {
                        prodType = "Miscellaneous"
                    }
                    newProd.type = prodType
                    const DeleteEmbed = new MessageEmbed()
                        .setTitle("**NEW PRODUCT**")
                        .setColor("#8fffab")
                        .setDescription("Enter Products Emote")
                        .addField("MAKE SURE THIS IS CORRECT, AS IT CANNOT BE CHANGED AFTER THE PRODUCT HAS BEEN CREATED", "_ _", true);
                    message.channel.messages.fetch({ around: newProdId, limit: 1 }).then(msg => {
                        const fetchedMsg = msg.first();
                        fetchedMsg.edit(DeleteEmbed);
                    }); message.delete();
                    currAction = "stp_prod_emote"
                } else {
                    const DeleteEmbed = new MessageEmbed()
                        .setTitle("**ENTRY ERROR**")
                        .setColor("#ff8f8f")
                        .setDescription("Entry wasnt valid. Please enter one of the following: Kb, Kc, Mc, Keycaps, Keyboard, Misc, or Miscellaneous.");
                    message.channel.messages.fetch({ around: newProdId, limit: 1 }).then(msg => {
                        const fetchedMsg = msg.first();
                        fetchedMsg.edit(DeleteEmbed);
                    }); message.delete();
                }
            } else if (currAction == "stp_prod_emote") {
                if (database.emotes.indexOf(message.content) == -1) {
                    newProd.emote = message.content
                    const DeleteEmbed = new MessageEmbed()
                        .setTitle("**NEW PRODUCT**")
                        .setColor("#8fffab")
                        .setDescription("Enter Group Buy Start Date or N/A for products in IC, or in-stock products")
                        .addFields(
                            { name: 'MM/DD/YYYY format OR N/A', value: '_ _' },
                        );
                    message.channel.messages.fetch({ around: newProdId, limit: 1 }).then(msg => {
                        const fetchedMsg = msg.first();
                        fetchedMsg.edit(DeleteEmbed);
                    }); message.delete();
                    currAction = "stp_prod_start"
                } else {
                    const DeleteEmbed = new MessageEmbed()
                        .setTitle("**ENTRY ERROR**")
                        .setColor("#ff8f8f")
                        .setDescription("That emote is already in use. Please try again");
                    message.channel.messages.fetch({ around: newProdId, limit: 1 }).then(msg => {
                        const fetchedMsg = msg.first();
                        fetchedMsg.edit(DeleteEmbed);
                    }); message.delete();
                }
            } else if (currAction == "stp_prod_start") {
                if (message.content.startsWith("N/A") || message.content.startsWith("N/a") || message.content.startsWith("n/a") || message.content.startsWith("NA") || message.content.startsWith("Na") || message.content.startsWith("na")) {
                    newProd.gbStart = "N/A"
                    newProd.gbEnd = "N/A"
                    const DeleteEmbed = new MessageEmbed()
                        .setTitle("**NEW PRODUCT**")
                        .setColor("#8fffab")
                        .setDescription("Check If All Info Is Correct!")
                        .addFields(
                            { name: 'Name', value: newProd.name },
                            { name: 'Link', value: newProd.link },
                            { name: 'Category', value: newProd.type },
                            { name: 'Emote', value: newProd.emote },
                            { name: 'Group Buy Start Date', value: newProd.gbStart },
                            { name: 'Group Buy End Date', value: newProd.gbEnd },
                            { name: 'Reply with "yes" if all info is correct, reply "no" to abort the product creation.', value: "_ _" },
                        );
                    message.channel.messages.fetch({ around: newProdId, limit: 1 }).then(msg => {
                        const fetchedMsg = msg.first();
                        fetchedMsg.edit(DeleteEmbed);
                    }); message.delete();
                    currAction = "stp_prod_confirm"
                } else if (isDate(message.content)) {
                    newProd.gbStart = message.content
                    const DeleteEmbed = new MessageEmbed()
                        .setTitle("**NEW PRODUCT**")
                        .setColor("#8fffab")
                        .setDescription("Enter Group Buy End Date")
                        .addFields(
                            { name: 'MM/DD/YYYY format', value: '_ _' },
                        );
                    message.channel.messages.fetch({ around: newProdId, limit: 1 }).then(msg => {
                        const fetchedMsg = msg.first();
                        fetchedMsg.edit(DeleteEmbed);
                    }); message.delete();
                    currAction = "stp_prod_end"
                } else {
                    const DeleteEmbed = new MessageEmbed()
                        .setTitle("**ENTRY ERROR**")
                        .setColor("#ff8f8f")
                        .setDescription("Entry wasnt a valid date. Please enter a new date in the MM/DD/YYYY format.");
                    message.channel.messages.fetch({ around: newProdId, limit: 1 }).then(msg => {
                        const fetchedMsg = msg.first();
                        fetchedMsg.edit(DeleteEmbed);
                    }); message.delete();
                }
            } else if (currAction == "stp_prod_end") {
                if (isDate(message.content) && newProd.gbStart < message.content) {
                    newProd.gbEnd = message.content
                    const DeleteEmbed = new MessageEmbed()
                        .setTitle("**NEW PRODUCT**")
                        .setColor("#8fffab")
                        .setDescription("Check If All Info Is Correct!")
                        .addFields(
                            { name: 'Name', value: newProd.name },
                            { name: 'Link', value: newProd.link },
                            { name: 'Category', value: newProd.type },
                            { name: 'Emote', value: newProd.emote },
                            { name: 'Group Buy Start Date', value: newProd.gbStart },
                            { name: 'Group Buy End Date', value: newProd.gbEnd },
                            { name: 'Reply with "yes" if all info is correct, reply "no" to abort the product creation.', value: "_ _" },
                        );
                    message.channel.messages.fetch({ around: newProdId, limit: 1 }).then(msg => {
                        const fetchedMsg = msg.first();
                        fetchedMsg.edit(DeleteEmbed);
                    }); message.delete();
                    currAction = "stp_prod_confirm"
                } else if (isDate(message.content) != true) {
                    const DeleteEmbed = new MessageEmbed()
                        .setTitle("**ENTRY ERROR**")
                        .setColor("#ff8f8f")
                        .setDescription("Entry wasnt a valid date. Please enter a new date in the MM/DD/YYYY format.");
                    message.channel.messages.fetch({ around: newProdId, limit: 1 }).then(msg => {
                        const fetchedMsg = msg.first();
                        fetchedMsg.edit(DeleteEmbed);
                    }); message.delete();
                } else if (newProd.gbStart > message.content) {
                    const DeleteEmbed = new MessageEmbed()
                        .setTitle("**ENTRY ERROR**")
                        .setColor("#ff8f8f")
                        .setDescription("The Group Buy end date can't be before the start date. Please enter a date later than " + newProd.gbStart);
                    message.channel.messages.fetch({ around: newProdId, limit: 1 }).then(msg => {
                        const fetchedMsg = msg.first();
                        fetchedMsg.edit(DeleteEmbed);
                    }); message.delete();
                } else if (newProd.gbStart == message.content) {
                    const DeleteEmbed = new MessageEmbed()
                        .setTitle("**ENTRY ERROR**")
                        .setColor("#ff8f8f")
                        .setDescription("The Group Buy end date can't be the same as the start date. Please enter a date later than " + newProd.gbStart);
                    message.channel.messages.fetch({ around: newProdId, limit: 1 }).then(msg => {
                        const fetchedMsg = msg.first();
                        fetchedMsg.edit(DeleteEmbed);
                    }); message.delete();
                }
            } else if (currAction == "stp_prod_confirm") {
                if (message.content.includes("YES") || message.content.includes("Yes") || message.content.includes("yes")) {
                    var server = message.guild;


                    message.guild.roles.create({
                        data: {
                            name: newProd.name
                        }
                    }).then(role => {
                        /*message.channel.setParent(message.guild.channels.cache.find(c => c.name == newProd.type && c.type == "category").id) ;
                        message.channel.setName("hgj")
                        message.channel.overwritePermissions([
                            {
                                id: role.id,
                                allow: ['VIEW_CHANNEL']
                            }, {
                                id: message.guild.id, // @everyone role
                                deny: ['VIEW_CHANNEL']
                            }
                        ])*/
                        message.channel.edit({
                            topic: `${newProd.emote} GB from ${newProd.gbStart} to ${newProd.gbEnd} | ${newProd.link}`,
                            parentID: message.guild.channels.cache.find(c => c.name == newProd.type && c.type == "category").id,
                            name: newProd.emote + " " + newProd.name,
                            permissionOverwrites: [
                                {
                                    id: role.id,
                                    allow: ['VIEW_CHANNEL']
                                }, {
                                    id: message.guild.id, // @everyone role
                                    deny: ['VIEW_CHANNEL']
                                }]
                        }).then(channel => {
                            newProd.roleId = role.id;
                            newProd.chanId = channel.id;
                            const DeleteEmbed = new MessageEmbed()
                                .setTitle("**NEW PRODUCT**")
                                .setColor("#8fffab")
                                .setDescription("New Product Created!");
                            message.channel.messages.fetch({ around: newProdId, limit: 1 }).then(msg => {
                                const fetchedMsg = msg.first();
                                fetchedMsg.edit(DeleteEmbed);
                            }); message.delete();
                            currAction = null
                            newProdUser = null;
                            var newJson;
                            fs.readFile('db.json', function (err, data) {
                                if (err) {
                                    message.channel.send(err)
                                    throw err;
                                }
                                var json = JSON.parse(data)
                                console.dir(json)
                                json.products.push(newProd)
                                json.emotes.push(newProd.emote)
                                json.roles.push(newProd.name);
                                newJson = json;
                                console.dir(json)
                                fs.writeFile('db.json', JSON.stringify(json), (err) => {
                                    if (err) {
                                        message.channel.send(err)
                                        throw err;
                                    }
                                });
                            })
                        })
                    }).catch(console.error);



                } else if (message.content.includes("NO") || message.content.includes("no") || message.content.includes("No") || message.content.includes("nO")) {
                    const DeleteEmbed = new MessageEmbed()
                        .setTitle("**ENTRY CANCELLED**")
                        .setColor("#ff8f8f")
                    message.channel.messages.fetch({ around: newProdId, limit: 1 }).then(msg => {
                        const fetchedMsg = msg.first();
                        fetchedMsg.edit(DeleteEmbed);
                    }); message.delete();
                    currAction = null
                    newProd = ""
                    newProdUser = null;
                }
                updateProdList()
            }


        }

        //console.dir(newProd)
        if (message.content.startsWith("k.extras")) {
            message.channel.send({ files: ["https://i.imgur.com/MVmKw32.png"] })
        } else if (message.content.startsWith("k.friedextras") || message.content.startsWith("k.fried")) {
            message.channel.send({ files: ["https://media.discordapp.net/attachments/545053174231466004/720456942690107452/friedextras.png"] })
        } else if (message.content.startsWith("k.tangies")) {
            message.channel.send({ files: ["https://i.imgur.com/vnQDf1k.png"] })
        } else if (message.content.startsWith("k.soon")) {
            message.channel.send({ files: ["https://cdn.discordapp.com/attachments/715077589827584081/715366729429024799/soontm.gif"] })
        } else if (message.content.startsWith("k.new")) {
            const DeleteEmbed = new MessageEmbed()
                .setTitle("**NEW PRODUCT**")
                .setColor("#8fffab")
                .setDescription("Enter Products Name");
            message.channel.send(DeleteEmbed).then(message => {
                newProdId = (message.id)
            });
            currAction = "prod_name"
            newProdUser = message.member.id;
        }
        else if (message.content.startsWith("k.setup")) {
            const DeleteEmbed = new MessageEmbed()
                .setTitle("**SETUP PRE-EXISTING PRODUCT**")
                .setColor("#8fffab")
                .setDescription("Enter Products Name");
            message.channel.send(DeleteEmbed).then(message => {
                newProdId = (message.id)
            });
            currAction = "stp_prod_name"
            newProdUser = message.member.id;
        }

    }
})
function delProd() {

}
function isDate(value) {
    var dateFormat;
    if (toString.call(value) === '[object Date]') {
        return true;
    }
    if (typeof value.replace === 'function') {
        value.replace(/^\s+|\s+$/gm, '');
    }
    dateFormat = /(^\d{1,4}[\.|\\/|-]\d{1,2}[\.|\\/|-]\d{1,4})(\s*(?:0?[1-9]:[0-5]|1(?=[012])\d:[0-5])\d\s*[ap]m)?$/;
    return dateFormat.test(value);
}

setInterval(() => {
    updateProdList()
}, 600000);

function getStatus(gbS, gbE) {
    if (gbS == "N/A" || gbE == "N/A") {
        return ('Upcoming')
    } else {
        var gbStartDate = new Date(gbS)
        var gbEndDate = new Date(gbE)
        if (getDate().getTime() === gbStartDate.getTime()) {
            return (`GB starts today and ends in ${getTimeTillDate(getDate(), gbEndDate)}`)
        } else if (getDate().getTime() === gbEndDate.getTime()) {
            return (`GB ends today`)
        } else if (getDate() > gbStartDate && getDate() < gbEndDate) {
            return (`GB ends in ${getTimeTillDate(getDate(), gbEndDate)}`)
        } else if (getDate() < gbStartDate) {
            return (`GB starts in ${getTimeTillDate(getDate(), gbStartDate)}`)
        } else if (getDate() > gbEndDate) {
            return (`GB ended`)
        }
    }
}
async function updateProdList() {
    var kbChann = client.channels.cache.get(database.kbchann);
    var kcChann = client.channels.cache.get(database.kcchann);
    var mcChann = client.channels.cache.get(database.mcchann);
    var prodChann = client.channels.cache.get("717500331466162188");
    var dummyChann = client.channels.cache.get("718977225612853309");
    var entireMsg;
    var kcMsg = [];
    var kbMsg = [];
    var mcMsg = [];
    var keycaps = [];
    var keyboards = [];
    var misc = [];
    var keycapAmt = 0;
    var keyboardAmt = 0;
    var miscAmt = 0;
    var kbArr = ["first id"];
    var kcArr = ["first id"];
    var mcArr = ["first id"];
    var havetoupdateJSON = false;
    for (let i = 0; i < database.products.length; i++) {
        const prod = database.products[i];
        if (prod.type == "Keycaps") keycapAmt += 1
        if (prod.type == "Keyboards") keyboardAmt += 1
        if (prod.type == "Miscellaneous") miscAmt += 1

    }
    if ((Math.floor(miscAmt / 20) + 1 - (database.mcrr.length)) != 0) {
        for (let i = 0; i < (Math.floor(miscAmt / 20) + 1 - (database.mcrr.length)); i++) {
            //mcArr.push("owo")
            await mcChann.send("_ _").then(msg => {
                database.mcrr.push(msg.id)
                havetoupdateJSON = true
            })
        }
    }
    if ((Math.floor(keyboardAmt / 20) + 1 - (database.kbrr.length)) != 0) {
        for (let i = 0; i < (Math.floor(keyboardAmt / 20) + 1 - (database.kbrr.length)); i++) {
            await kbChann.send("_ _").then(msg => {
                database.kbrr.push(msg.id)
                havetoupdateJSON = true
            })
        }
    }
    if ((Math.floor(keycapAmt / 20) + 1 - (database.kcrr.length)) != 0) {
        for (let i = 0; i < (Math.floor(keycapAmt / 20) + 1 - (database.kcrr.length)); i++) {
            await kcChann.send("_ _").then(msg => {
                database.kcrr.push(msg.id)
                havetoupdateJSON = true
            })
        }
    }
    if (havetoupdateJSON == true) {
        fs.writeFile('db.json', JSON.stringify(database), (err) => {
            if (err) {
                message.channel.send(err)
                throw err;
            }
        });
    }
    fs.readFile('db.json', async function (err, data) {
        if (err) {
            message.channel.send(err)
            throw err;
        }
        var json = JSON.parse(data)
        var arr = ["owo"]
        var kcAmt = 0;
        var kbAmt = 0;
        var mcAmt = 0
        for (let i = 0; i < json.products.length; i++) {
            const prod = json.products[i];
            const prodOP = json.products[i + 1];
            if (JSON.stringify(prod.type).includes("Kc") || JSON.stringify(prod.type).includes("kc") || JSON.stringify(prod.type).includes("Keycaps") || JSON.stringify(prod.type).includes("Keycap") || JSON.stringify(prod.type).includes("keycaps") || JSON.stringify(prod.type).includes("keycap")) {
                keycaps.push(prod)

                kcChann.messages.fetch({ around: database.kcrr[Math.floor(kcAmt / 20)], limit: 1 }).then(async (msg) => {
                    const fetchedMsg = msg.first();

                    fetchedMsg.react(prod.emote);
                });
                kcMsg[Math.floor(kcAmt / 20)] = kcMsg[Math.floor(kcAmt / 20)] + "\n"+prod.emote+" `"+prod.name+"` | " + prod.gbStart+" - "+prod.gbEnd+"|"+prod.link
                kcAmt++;
                //console.log(kcMsg[0] + "\n\n")
                //console.log(kcMsg[1] + "\n\n")
            } else if (JSON.stringify(prod.type).includes("Kb") || JSON.stringify(prod.type).includes("kb") || JSON.stringify(prod.type).includes("Keyboard") || JSON.stringify(prod.type).includes("keyboard")) {
                keyboards.push(prod)
                //keyboardAmt += 1;
                kbChann.messages.fetch({ around: database.kbrr[Math.floor(kbAmt / 20)], limit: 1 }).then(msg => {
                    const fetchedMsg = msg.first();
                    fetchedMsg.react(prod.emote)
                });
                kbMsg[Math.floor(kbAmt / 20)] = kbMsg[Math.floor(kbAmt / 20)] + "\n"+prod.emote+" `"+prod.name+"` | " + prod.gbStart+" - "+prod.gbEnd+"|"+prod.link
                kbAmt++;
            } else if (JSON.stringify(prod.type).includes("Mc") || JSON.stringify(prod.type).includes("mc") || JSON.stringify(prod.type).includes("Misc") || JSON.stringify(prod.type).includes("misc") || JSON.stringify(prod.type).includes("Miscellaneous") || JSON.stringify(prod.type).includes("miscellaneous")) {
                misc.push(prod)
                //miscAmt += 1;
                mcChann.messages.fetch({ around: database.mcrr[Math.floor(mcAmt / 20)], limit: 1 }).then(msg => {
                    const fetchedMsg = msg.first();
                    fetchedMsg.react(prod.emote);
                });
                mcMsg[Math.floor(mcAmt / 20)] = mcMsg[Math.floor(mcAmt / 20)] + "\n"+prod.emote+" `"+prod.name+"` | " + prod.gbStart+" - "+prod.gbEnd+"|"+prod.link
                mcAmt++;
            }
        }
        for (let i = 0; i < kcMsg.length; i++) {
            var fmsg = kcMsg[i].replace("undefined", "");
            await kcChann.messages.fetch({ around: database.kcrr[i], limit: 1 }).then(msg => {
                const fetchedMsg = msg.first();
                fetchedMsg.edit(fmsg);
                console.log(fmsg)

            });
        }
        for (let i = 0; i < kbMsg.length; i++) {
            var fmsg = kbMsg[i].replace("undefined", "");
            await kbChann.messages.fetch({ around: database.kbrr[i], limit: 1 }).then(msg => {
                const fetchedMsg = msg.first();
                fetchedMsg.edit(fmsg);
                console.log(fmsg)

            });
        }
        for (let i = 0; i < mcMsg.length; i++) {
            var fmsg = mcMsg[i].replace("undefined", "");
            await mcChann.messages.fetch({ around: database.mcrr[i], limit: 1 }).then(msg => {
                const fetchedMsg = msg.first();
                fetchedMsg.edit(fmsg);
                console.log(fmsg)

            });
        }
    })



}
function validURL(str) {
    var pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
        '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
    return !!pattern.test(str);
}
function getDate() {
    var today = new Date();
    var dd = today.getDate();

    var mm = today.getMonth() + 1;
    var yyyy = today.getFullYear();
    if (dd < 10) {
        dd = '0' + dd;
    }

    if (mm < 10) {
        mm = '0' + mm;
    }
    return new Date(`${mm}/${dd}/${yyyy}`)
}

function getTimeTillDate(d1, d2) {
    const date1 = new Date(d1);
    const date2 = new Date(d2);
    const diffDays = Math.ceil(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));
    var message;
    if (diffDays > 1) {
        message = diffDays + " days"
    } else {
        message = diffDays + " day"
    }
    return message;
}
client.on("messageDelete", (messageDelete) => {
    if (messageDelete.channel != "691013459554336878" || messageDelete.channel != database.verifchann) {
        // Send the message to a designated channel on a server:
        const channel = messageDelete.member.guild.channels.cache.find(ch => ch.name === 'kevin-logs');


        const DeleteEmbed = new MessageEmbed()
            .setTitle("**DELETED MESSAGE**")
            .setColor("#fc3c3c")
            .addField("Author", messageDelete.author.tag, true)
            .addField("Channel", messageDelete.channel, true)
            .addField("Message", messageDelete.content)
            .setFooter(`Message ID: ${messageDelete.id} | Author ID: ${messageDelete.author.id}`);

        channel.send(DeleteEmbed);
    }
});
client.on("messageUpdate", (oldMessage, newMessage) => {
    if (oldMessage.channel != "691013459554336878") {
        // Send the message to a designated channel on a server:
        const channel = oldMessage.member.guild.channels.cache.find(ch => ch.name === 'kevin-logs');

        if (oldMessage.author != "714602541157187665") {
            const DeleteEmbed = new MessageEmbed()
                .setTitle("**EDITED MESSAGE**")
                .setColor("#3bfcbc")
                .addField("Author", oldMessage.author.tag, true)
                .addField("Channel", oldMessage.channel, true)
                .addField("Original Message", `${oldMessage.content}** **`)
                .addField("New Message", `${newMessage.content}** **`)
                .setFooter(`Message ID: ${oldMessage.id} | Author ID: ${oldMessage.author.id}`);

            channel.send(DeleteEmbed);
        }
    }
});
function eval(i) {

}
client.on("raw", (event) => {

    if (event.t == "MESSAGE_REACTION_ADD") {
        if (event.d.channel_id == database.kbchann || event.d.channel_id == database.kcchann || event.d.channel_id == database.mcchann) {
            var reactionChannel = client.channels.cache.get(event.d.channel_id);
            if (reactionChannel.messages.cache.has(event.d.message_id)) {
                return
            } else {
                reactionChannel.messages.fetch(event.d.message_id).then(msg => {
                    var messageReaction = msg.reactions.cache.get(event.d.emoji.name + ":" + event.d.emoji.id)
                    var user = client.users.get(event.d.user_id);
                    client.emit('messageReactionAdd', messageReaction, user)
                })
            }
        }
    } else if (event.t == "MESSAGE_REACTION_REMOVE") {
        if (event.d.channel_id == database.kbchann || event.d.channel_id == database.kcchann || event.d.channel_id == database.mcchann) {
            var reactionChannel = client.channels.cache.get(event.d.channel_id);
            if (reactionChannel.messages.cache.has(event.d.message_id)) {
                return
            } else {
                reactionChannel.messages.fetch(event.d.message_id).then(msg => {
                    var messageReaction = msg.reactions.cache.get(event.d.emoji.name + ":" + event.d.emoji.id)
                    var user = client.users.get(event.d.user_id);
                    client.emit('messageReactionRemove', messageReaction, user)
                })
            }
        }
    }
})
client.on('messageReactionAdd', (messageReaction, user) => {
    var roleName = database.roles[database.emotes.indexOf(messageReaction.emoji.name)]
    var role = messageReaction.message.guild.roles.cache.find(role => role.name === roleName)
    if (role) {
        var member = messageReaction.message.guild.members.cache.find(member => member.id === user.id)
        if (member) {
            member.roles.add(role.id)
        }
    }
})
client.on('messageReactionRemove', (messageReaction, user) => {
    var roleName = database.roles[database.emotes.indexOf(messageReaction.emoji.name)]
    var role = messageReaction.message.guild.roles.cache.find(role => role.name === roleName)
    console.log(messageReaction.message.channel.id)
    if (role) {
        var member = messageReaction.message.guild.members.cache.find(member => member.id === user.id)
        if (messageReaction.message.channel.id == database.kbchann||messageReaction.message.channel.id == database.kcchann||messageReaction.message.channel.id == database.mcchann) {
            member.roles.remove(role.id)
        }
    }
})